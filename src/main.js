import { createApp } from "vue";
import { createPinia } from "pinia";
import WinUIOnWeb from "winuionweb";
import "winuionweb/style.css";
import App from "./App.vue";
import router from "./router";
import "./styles/app.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(WinUIOnWeb, { locale: "zh-CN" });

app.mount("#app");
