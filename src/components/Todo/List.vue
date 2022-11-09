<template>
    <v-row align='center' justify='center'>
        <v-col cols='8'>
            <v-text-field
                v-model='newTodo'
                label='What do you need to do?'
                variant='solo'

            >
                <template v-slot:append-inner>
                    <v-btn
                        color='orange'

                        prepend-icon='mdi-plus'
                        class='mt-n2 text-white'
                        @click='addTodo'
                        :disabled='!hasTodo'
                    >
                        Add
                    </v-btn>
                </template>
            </v-text-field>
        </v-col>
    </v-row>

    <v-row align='center' justify='center'>
        <v-col cols='8'>
            <v-list flat>
                <TodoItem v-for='(todo,i) in todos'
                          @toggled='toggleTodo'
                          :index='i'
                          :text='todo.text'
                          :completed='todo.completed'
                />
            </v-list>
        </v-col>
    </v-row>
</template>

<script setup>
import { ref, computed, inject, onBeforeUnmount } from 'vue';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import TodoItem from './Item.vue';
import zoomSdk from '@zoom/appssdk';
import { useRouter } from 'vue-router';

const router = useRouter()
if (!zoomSdk) router.push({ name: 'install'})

const path = 'todos';

const newTodo = ref('');
const hasTodo = computed(() => newTodo.value.length > 0);

const db = inject('db');

const { meetingUUID } = await zoomSdk.getMeetingUUID();
const uuid = meetingUUID.replace('/', '') || "";

const todos = ref([]);

async function addTodo() {
    if (!hasTodo) return;
    todos.value.push({
        text: newTodo.value,
        completed: false,
    });

    try {
        await setDoc(doc(db, path, uuid), {
            todos: todos.value,
        });

        newTodo.value = '';
    } catch (e) {
        console.error('Error adding document: ', e);
    }
}


async function toggleTodo(index) {
    const todo = todos.value[index];
    todo.completed = !todo.completed;

    try {
        await setDoc(doc(db, path, uuid), {
            todos: todos.value,
        });
    } catch (e) {
        console.error('Error updating document: ', e);
    }
}

const unsub = onSnapshot(doc(db, path, uuid), (doc) => {
    const t = doc.data()?.todos;

    if (t && t.length > 0) {
        todos.value = t;
    }
});

onBeforeUnmount(() => {
    unsub();
});

</script>

<style scoped>

</style>