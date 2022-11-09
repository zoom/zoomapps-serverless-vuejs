import functions from 'firebase-functions';
import admin from 'firebase-admin';
import axios from 'axios';
import * as crypto from 'crypto';
import { URL } from 'url';

const zoomHost = process.env.ZM_HOST || 'https://zoom.us';
admin.initializeApp();

// returns a random string of format fmt
const rand = (fmt, depth = 32) => crypto.randomBytes(depth).toString(fmt);

// returns a base64 encoded url
const base64URL = (s) =>
    s.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

const getDeeplink = async (token) => {
    const { data } = await axios({
        method: 'POST',
        baseURL: zoomHost,
        url: '/v2/zoomapp/deeplink',
        data: {
            action: JSON.stringify({
                url: '/',
                role_name: 'Owner',
                verified: 1,
                role_id: 0,
            }),
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return data.deeplink;
};

const getToken = async (code, verifier) => {
    const { data } = await axios({
        method: 'POST',
        baseURL: zoomHost,
        url: '/oauth/token',
        data: new URLSearchParams({
            code,
            redirect_uri: process.env.ZM_REDIRECT_URL,
            code_verifier: verifier,
            grant_type: 'authorization_code',
        }).toString(),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            username: process.env.ZM_CLIENT_ID,
            password: process.env.ZM_CLIENT_SECRET,
        },
    });

    return data.access_token;
};

const checkQuery = (name, val, res, type = 'string') => {
    const isValid = (val && typeof val === type);
    if (!isValid) res.status(400).send(`required query parameter "${name}" was not found`);
    return isValid;
};

export const install = functions.https.onCall(async (data, context) => {
    // generate a random state and verifier
    const state = `${rand('base64')}:${context.auth.uid}`;
    const verifier = rand('ascii');

    // create a code challenge using the S256 method
    const digest = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64')
        .toString();

    const challenge = base64URL(digest);

    // get the Firebase UID for later
    const { uid } = context.auth;

    // build our request to the Zoom OAuth authorization API
    const url = new URL('/oauth/authorize', zoomHost);

    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', process.env.ZM_CLIENT_ID);
    url.searchParams.set('redirect_uri', process.env.ZM_REDIRECT_URL);
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);

    // Store our unique state and verifier at this UID
    await admin.firestore()
        .collection('users')
        .doc(uid)
        .set({
            state,
            verifier,
        });

    return url.href;
});

export const redirectURL = functions.https.onRequest(async (req, res) => {
    const code = req.query.code;
    const stateQuery = req.query.state;

    // make sure we were passed valid code and state values
    if (!checkQuery('code', code, res)) return;
    if (!checkQuery('state', stateQuery, res)) return;

    // state query follows the format [state]:[firebase uid]
    // we need to split it to get both
    const splitQuery = stateQuery.split(':');
    if (splitQuery.length !== 2)
        return res.status(500).send('Firebase UID not found in state');

    const uid = splitQuery[1];

    try {
        // get our state and verifier stored in firestore
        const doc = await admin.firestore()
            .collection('users')
            .doc(uid)
            .get();

        const state = doc.get('state');
        const verifier = doc.get('verifier');

        // check that we were passed valid state and verifier queries
        if (!state || stateQuery !== state)
            return res.status(400).send('invalid state parameter');

        if (!verifier)
            return res.status(500).send('invalid code verifier');

        // use our code and verifier to get a token
        const accessToken = await getToken(code, verifier);

        // use our access token to get a deeplink
        const deeplink = await getDeeplink(accessToken);

        // open our app in Zoom
        res.redirect(deeplink);
    } catch (e) {
        return res.status(500).send(e.message);
    }
});
