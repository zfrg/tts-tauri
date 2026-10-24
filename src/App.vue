<template>
  <WinToolTipService />
  <div class="app-root">
    <WinTitleBar
      class="app-titlebar"
      Title="tts-tauri"
      PreferredHeightOption="Tall"
      :IsBackButtonVisible="false"
      :IsPaneToggleButtonVisible="true"
      @PaneToggleRequested="onPaneToggle">
      <template #RightHeader>
        <WindowControls />
      </template>
    </WinTitleBar>
    <div class="app-content">
      <WinNavigationView
        :MenuItems="navMenuItems"
        :SelectedItem="selectedNavItem"
        :IsPaneOpen="paneOpen"
        PaneDisplayMode="Left"
        IsBackButtonVisible="Collapsed"
        :IsPaneToggleButtonVisible="false"
        :IsSettingsVisible="false"
        @update:IsPaneOpen="paneOpen = $event"
        @ItemInvoked="onItemInvoked">
        <RouterView v-if="ready" />
      </WinNavigationView>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import { connect } from "./utils/sqlite";
import { useVoicesStore } from "./store/voices";
import { show_error } from "./utils/function";
import { useOptionStore } from "./store/option";

import WinTitleBar from "@winui/components/TitleBar.vue";
import WinNavigationView from "@winui/components/NavigationView.vue";
import WinToolTipService from "@winui/components/ToolTipService.vue";
import WindowControls from "./components/WindowControls.vue";

const router = useRouter();
const route = useRoute();
const voicesStore = useVoicesStore();
const optionStore = useOptionStore();

const ready = ref(false);
const paneOpen = ref(true);

const navMenuItems = computed(() => [
  { Tag: "tts", Icon: "󰋋", Content: "配音" },
  { Tag: "set", Icon: "", Content: "设置" },
]);

const selectedNavItem = computed(() => {
  const tag = route.path.replace("/", "") || "tts";
  return navMenuItems.value.find((i) => i.Tag === tag) || navMenuItems.value[0];
});

function onPaneToggle() { paneOpen.value = !paneOpen.value; }
function onItemInvoked(e) {
  const tag = e?.InvokedItemContainer?.Tag;
  if (!tag) return;
  router.push("/" + tag);
}

const readObject = reactive({ voices: false, option: false, exePath: false });

onMounted(() => {
  connect()
    .then(() => {
      voicesStore.getVoicesList().then(()=>{readObject.voices=true;}).catch(err=>{show_error(err);readObject.voices=true;});
      optionStore.getExePath().then(()=>{readObject.exePath=true; return optionStore.getOption();}).then(()=>{readObject.option=true;}).catch(err=>{show_error(err);readObject.exePath=true;readObject.option=true;});
    })
    .catch(console.error);

  const timer = setInterval(()=>{
    if(readObject.voices && readObject.option && readObject.exePath){ clearInterval(timer); ready.value = true; }
  }, 50);
});
</script>

<style>
@import "@winui/styles/theme.css";
@import "@winui/styles/icons.css";
@import "@winui/styles/animations.css";
</style>

<style scoped>
.app-root { width: 100vw; height: 100vh; overflow: hidden; }
.app-titlebar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; }
.app-content { width: 100%; height: 100vh; padding-top: 48px; box-sizing: border-box; display: flex; }
.app-content :deep(.win-nav-shell) { width: 100%; height: 100%; }
</style>
