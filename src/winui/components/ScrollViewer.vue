<template>
  <div
    ref="root"
    class="ScrollViewer"
    :style="rootStyle"
    @wheel="onWheel"
    @scroll="onScroll"
  >
    <div ref="content" class="ScrollViewerContent" :style="contentStyle">
      <slot />
    </div>
    <div v-if="showVertical" ref="vBar" class="ScrollBar ScrollBarVertical" role="scrollbar" aria-orientation="vertical">
      <div class="ScrollBarTrack">
        <div class="ScrollBarThumb" :style="vThumbStyle" @mousedown="onThumbDown($event, 'v')" />
      </div>
    </div>
    <div v-if="showHorizontal" ref="hBar" class="ScrollBar ScrollBarHorizontal" role="scrollbar" aria-orientation="horizontal">
      <div class="ScrollBarTrack">
        <div class="ScrollBarThumb" :style="hThumbStyle" @mousedown="onThumbDown($event, 'h')" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'ScrollViewer',
  props: {
    HorizontalScrollMode: { type: [String, Boolean], default: 'Auto' },
    VerticalScrollMode: { type: [String, Boolean], default: 'Auto' },
    HorizontalScrollBarVisibility: { type: String, default: 'Auto' },
    VerticalScrollBarVisibility: { type: String, default: 'Auto' },
    IsVerticalRailEnabled: { type: Boolean, default: true },
    IsHorizontalRailEnabled: { type: Boolean, default: true },
    ZoomMode: { type: String, default: 'Disabled' },
    Padding: { type: [String, Number], default: 0 },
    Background: { type: [String, Object], default: null },
    BorderBrush: { type: String, default: null },
    BorderThickness: { type: [String, Number], default: 0 },
    CornerRadius: { type: [String, Number], default: 0 }
  },
  emits: ['viewChanged', 'viewChanging'],
  setup(props, { emit }) {
    const root = ref(null)
    const content = ref(null)
    const vBar = ref(null)
    const hBar = ref(null)

    const rootStyle = computed(() => ({
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      height: '100%'
    }))

    const contentStyle = computed(() => ({
      overflow: 'auto',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box'
    }))

    const showVertical = computed(() => {
      const v = props.VerticalScrollBarVisibility
      return v !== 'Hidden' && v !== 'Disabled'
    })
    const showHorizontal = computed(() => {
      const h = props.HorizontalScrollBarVisibility
      return h !== 'Hidden' && h !== 'Disabled'
    })

    const vThumbStyle = computed(() => ({ height: '40px', top: '0px' }))
    const hThumbStyle = computed(() => ({ width: '40px', left: '0px' }))

    const onWheel = () => {}
    const onScroll = (e) => {
      emit('viewChanged', { HorizontalOffset: e.target.scrollLeft, VerticalOffset: e.target.scrollTop, ZoomFactor: 1 }, { IsIntermediate: false })
    }
    const onThumbDown = () => {}

    onMounted(() => {
      if (content.value) content.value.style.overflow = 'auto'
    })
    onBeforeUnmount(() => {})

    return { root, content, vBar, hBar, rootStyle, contentStyle, showVertical, showHorizontal, vThumbStyle, hThumbStyle, onWheel, onScroll, onThumbDown }
  }
})
</script>

<style scoped>
.ScrollViewer { display: block; }
.ScrollViewerContent { scrollbar-width: thin; }
.ScrollBar { position: absolute; }
.ScrollBarVertical { right: 0; top: 0; bottom: 0; width: 8px; }
.ScrollBarHorizontal { left: 0; right: 0; bottom: 0; height: 8px; }
.ScrollBarTrack { position: relative; width: 100%; height: 100%; }
.ScrollBarThumb { position: absolute; background: rgba(128,128,128,0.5); border-radius: 4px; }
</style>
