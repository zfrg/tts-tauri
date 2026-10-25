<template>
  <ToolTipService />
  <div class="app-root">
    <TitleBar
      class="app-titlebar"
      Title="tts-tauri"
      PreferredHeightOption="Tall"
      IsCaptionButtonsVisible="True"
      AutoRefreshDragRegions="True"
      :IsBackButtonVisible="false"
      :IsPaneToggleButtonVisible="true"
      :IsPaneOpen="paneOpen"
      @PaneToggleRequested="togglePane"
      @MinimizeRequested="minimizeWindow"
      @MaximizeRequested="toggleMaximizeWindow"
      @CloseRequested="closeWindow"
      @pointerdown="onTitleBarPointerDown"
      @dblclick="onTitleBarDoubleClick" />

    <div class="app-content">
      <NavigationView
        class="app-nav"
        PaneDisplayMode="Left"
        :MenuItemsSource="navMenuItems"
        :SelectedItem="selectedNavItem"
        :IsPaneOpen="paneOpen"
        :IsSettingsVisible="false"
        IsBackButtonVisible="Collapsed"
        :IsPaneToggleButtonVisible="false"
        :AlwaysShowHeader="false"
        :IsTitleBarAutoPaddingEnabled="false"
        @update:IsPaneOpen="paneOpen = $event"
        @ItemInvoked="onItemInvoked">
        <div v-if="ready" class="app-page-host">
          <RouterView />
        </div>
        <div v-else class="app-loading">
          <ProgressRing :IsActive="true" :Width="48" :Height="48" />
          <TextBlock Text="正在加载数据……" Foreground="var(--TextFillColorSecondaryBrush, #5f5f5f)" />
        </div>
      </NavigationView>
    </div>

    <div class="app-notifications">
      <InfoBar
        v-for="item in notifications"
        :key="item.id"
        :IsOpen="true"
        :Severity="item.severity"
        :Title="item.title"
        :Message="item.message"
        @CloseButtonClick="dismiss(item.id)" />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { connect } from "./utils/sqlite";
import { useVoicesStore } from "./store/voices";
import { show_error } from "./utils/function";
import { useOptionStore } from "./store/option";
import { dismiss, notifications } from "./utils/notify";

const router = useRouter();
const route = useRoute();
const voicesStore = useVoicesStore();
const optionStore = useOptionStore();

const ready = ref(false);
const paneOpen = ref(true);

// 使用固定数组，保证 SelectedItem 的引用稳定
const navMenuItems = [
  { Tag: "tts", Icon: "\uE720", Content: "配音" },
  { Tag: "set", Icon: "\uE713", Content: "设置" },
];

const selectedNavItem = computed(() => {
  const tag = route.path.replace("/", "") || "tts";
  return navMenuItems.find((item) => item.Tag === tag) ?? navMenuItems[0];
});

function togglePane() {
  paneOpen.value = !paneOpen.value;
}

function onItemInvoked(sender, args) {
  const tag = args?.InvokedItemContainer?.Tag ?? args?.InvokedItem?.Tag;
  if (!tag) {
    return;
  }
  if (route.path !== "/" + tag) {
    router.push("/" + tag);
  }
}

/* ------------------------------ 窗口控制 ------------------------------ */

const tauriWindow =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
    ? getCurrentWindow()
    : null;

function minimizeWindow() {
  tauriWindow?.minimize().catch(console.error);
}

function toggleMaximizeWindow() {
  tauriWindow?.toggleMaximize().catch(console.error);
}

function closeWindow() {
  tauriWindow?.close().catch(console.error);
}

function isInteractiveTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(
    target.closest(
      "button, input, textarea, select, a, [role='button'], [role='textbox'], [contenteditable='true'], .win-titlebar-caption-host"
    )
  );
}

function onTitleBarPointerDown(event) {
  if (!tauriWindow || event.button !== 0 || isInteractiveTarget(event.target)) {
    return;
  }
  tauriWindow.startDragging().catch(() => {});
}

function onTitleBarDoubleClick(event) {
  if (!tauriWindow || isInteractiveTarget(event.target)) {
    return;
  }
  toggleMaximizeWindow();
}

/* ------------------------------ 主题 ------------------------------ */

const darkThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme() {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(darkThemeQuery.matches ? "theme-dark" : "theme-light");
}

/* ------------------------------ 初始化 ------------------------------ */

onMounted(async () => {
  applyTheme();
  darkThemeQuery.addEventListener("change", applyTheme);

  try {
    await connect();
  } catch (error) {
    show_error(error);
    ready.value = true;
    return;
  }

  const tasks = [];

  tasks.push(
    voicesStore.getVoicesList().catch((error) => {
      show_error(error);
    })
  );

  tasks.push(
    optionStore
      .getExePath()
      .then(() => optionStore.getOption())
      .catch((error) => {
        show_error(error);
      })
  );

  await Promise.allSettled(tasks);
  ready.value = true;
});

onBeforeUnmount(() => {
  darkThemeQuery.removeEventListener("change", applyTheme);
});
</script>
