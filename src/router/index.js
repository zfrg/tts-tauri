import { createRouter, createWebHashHistory } from "vue-router";

import TTS from "../pages/TTS.vue";
import SetPage from "../pages/SetPage.vue";

const routes = [
    { path: "/", redirect: "/tts" },
    { path: "/tts", component: TTS },
    { path: "/set", component: SetPage },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
