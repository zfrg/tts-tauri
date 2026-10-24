<template>
  <div class="window-controls" @dblclick.stop @mousedown.stop>
    <button type="button" class="window-control" @click="minimize"><span class="glyph">&#xE921;</span></button>
    <button type="button" class="window-control" @click="toggle"><span class="glyph">{{max?'\uE923':'\uE922'}}</span></button>
    <button type="button" class="window-control close" @click="close"><span class="glyph">&#xE8BB;</span></button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
const has = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const win = has ? getCurrentWindow() : null;
const max = ref(false);
async function refresh(){ if(!win)return; try{max.value=await win.isMaximized();}catch{} }
async function minimize(){ try{await win?.minimize();}catch{} }
async function toggle(){ try{await win?.toggleMaximize(); await refresh();}catch{} }
async function close(){ try{await win?.close();}catch{} }
let un=null;
onMounted(async()=>{ if(!win)return; await refresh(); try{un=await win.onResized(refresh);}catch{} });
onBeforeUnmount(()=>un?.());
</script>

<style scoped>
.window-controls{display:flex;height:100%}
.window-control{width:46px;height:100%;border:none;background:transparent;display:flex;align-items:center;justify-content:center}
.window-control:hover{background:rgba(0,0,0,0.04)}
.window-control.close:hover{background:#c42b1c;color:#fff}
.glyph{font-family:"Segoe Fluent Icons","Segoe MDL2 Assets",sans-serif;font-size:10px}
</style>
