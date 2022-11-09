import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const firebaseUID = ref('')
    const state = ref('')
    const verifier = ref('')

    return { firebaseUID, state, verifier }
})