<template>
    <v-list-item @click='toggleComplete' :value='index'>
        <template v-slot:prepend='{ isActive }'>

            <v-list-item-action start>
                <v-checkbox-btn @click.stop='toggleComplete' :model-value='completed' color='orange'></v-checkbox-btn>
            </v-list-item-action>
        </template>
        <v-list-item-title :class='classObject'>{{ text }}</v-list-item-title>
    </v-list-item>

</template>

<script setup>
import { reactive, toRefs } from 'vue';


const props = defineProps({
    index: Number,
    text: String,
    completed: Boolean,
});

const refs = toRefs(props);

const emit = defineEmits(['toggled']);

const classObject = reactive({
    'text-decoration-line-through': refs.completed,
    'text-grey-lighten-2': refs.completed,
});

const toggleComplete = () => {
    emit('toggled', props.index);
};
</script>