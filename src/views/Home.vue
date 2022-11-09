<template>
    <h2 class='text-center' v-if='isMainClient'>Start a Meeting to Use this App</h2>
    <TodoList v-else-if='isZoom' />
    <v-btn v-else @click='onClick' color='blue text-white'>Install Todos</v-btn>
</template>

<script setup>
import TodoList from '../components/Todo/List.vue';
import { computed } from 'vue';
import zoomSdk from '@zoom/appssdk';

import { getApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions(getApp());
const install = httpsCallable(functions, 'install');

if (process.env.NODE_ENV !== 'production')
    connectFunctionsEmulator(functions, 'localhost', 5001)

const onClick = async () => {
    try {
        const {data} = await install()
        const installURL = new URL(data)

        window.location = installURL.href
    } catch (e) {
        console.error(e);
    }
}


let context;
const isMainClient = computed(() =>
    context === 'inMainClient',
);


let isZoom = false

try {
    const configResponse = await zoomSdk.config({
        size: { width: 480, height: 360 },
        capabilities: [
            'getMeetingUUID',
        ],
    });

    isZoom = true;

    context = configResponse.runningContext;
    console.debug('Zoom JS SDK Configuration', configResponse);
} catch (e) {
    console.error(e);
}
</script>