import {createApp} from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router';
import vuetify from './plugins/vuetify'
import {loadFonts} from './plugins/webfontloader'

import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

import { useAuthStore } from './stores/auth.js';
import firebaseConfig from '../firebase.config.js';

const firebaseApp = initializeApp(firebaseConfig);
const pinia = createPinia()

const auth = getAuth();

const app = createApp(App)
    .use(vuetify)
    .use(router)
    .use(pinia)

const store = useAuthStore();

signInAnonymously(auth).then(() => {
    store.firebaseUID = auth.currentUser.uid
}).catch((e) => console.error(e));


const db = getFirestore(firebaseApp);

loadFonts().catch(e => console.error(e))

app.provide('db', db)
app.mount('#app')
