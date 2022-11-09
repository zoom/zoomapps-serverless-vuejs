<template>
    <v-app>
        <v-main>
            <v-img class='mb-12 mt-6' height='4vw' src='logo.png' />
            <v-container>
                <v-row>
                    <v-col>
                        <Suspense>
                            <router-view />
                        </Suspense>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup>
</script>
