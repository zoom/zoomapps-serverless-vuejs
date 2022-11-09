import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
import vuetify from 'vite-plugin-vuetify';

import firebaseConfig from './firebase.config.js';

const csp = 'default-src \'self\' unsafe-inline; ' +
    'img-src https://*; child-src \'none\'; ' +
    'style-src \'self\' \'unsafe-inline\' https://zoomapp-serverless-vue-01.web.app https://fonts.googleapis.com; ' +
    `connect-src  http://localhost:5001 https://* wss://*; ` +
    'font-src \'self\' https://fonts.gstatic.com'

const emulatorPath = `/${firebaseConfig.projectId}`

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            [emulatorPath]: {
                target: 'http://localhost:5001',
            },
        },
    },
    plugins: [
        vue(),
        vuetify({ autoImport: true }),
        {
            name: 'configure-response-headers',
            configureServer: server => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
                    res.setHeader('X-Content-Type-Options', 'nosniff');
                    res.setHeader('Content-Security-Policy', csp);
                    res.setHeader('Referrer-Policy', 'same-origin');
                    next();
                });
            }
        }
    ],
});
