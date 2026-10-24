import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { createI18n, i18nKey } from "@winui/components/i18n";
import "@winui/styles/theme.css";
import "@winui/styles/icons.css";
import "@winui/styles/animations.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
const i18n = createI18n(typeof navigator !== "undefined" ? navigator.language : "zh-CN");
app.provide(i18nKey, i18n);
app.mount("#app");
