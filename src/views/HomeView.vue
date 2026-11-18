<script setup lang="ts">
/**
 * 首页 · 房间主界面（技术方案 §05）
 * 三层结构：房间底图（CSS 占位，插画在 M2 替换）→ 光斑两层 → 碎片层 + 皇冠
 * 碎片以 left/top % 定位于 aspect-ratio 容器内，任意屏宽不跑位
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CHAPTERS, FRAGMENT_POS, chapterMeta } from '../config/chapters'
import { CROWN_BAND, CROWN_BODY, CROWN_VIEWBOX } from '../config/crown'
import { useProgress } from '../stores/progress'
import FragmentPiece from '../components/FragmentPiece.vue'
import Sparkles from '../components/Sparkles.vue'
import CrownNav from '../components/CrownNav.vue'

const router = useRouter()
const progress = useProgress()
const navOpen = ref(false)

/** 回场动画：刚刚点亮的碎片播 pop + 星苗，1.1s 后恢复呼吸态 */
const celebratingId = ref<string | null>(null)
const toast = ref('')

onMounted(() => {
  const id = progress.consumeLastLit()
  if (!id) return
  celebratingId.value = id
  toast.value = `✦ ${id} ${chapterMeta(id)?.title ?? ''} · 记忆碎片已点亮`
  window.setTimeout(() => {
    celebratingId.value = null
    toast.value = ''
  }, 1600)
})

function selectFragment(id: (typeof CHAPTERS)[number]['id']) {
  progress.visit(id)
  router.push(id === '07' ? '/game' : `/chapter/${id}`)
}
</script>

<template>
  <div class="home">
    <div class="room-wrap">
      <div class="room">
        <!-- 层 1：房间底图（M1 为 CSS 占位，M2 替换为房间插画） -->
        <div class="room-bg" aria-hidden="true"></div>

        <!-- 层 2：光斑两层景深 -->
        <Sparkles class="layer" :count="9" :depth="1" />
        <Sparkles class="layer" :count="6" :depth="2" />

        <!-- 层 3：七块记忆碎片 -->
        <FragmentPiece
          v-for="c in CHAPTERS"
          :key="c.id"
          :id="c.id"
          :title="c.title"
          :state="progress.data.fragments[c.id]"
          :celebrate="celebratingId === c.id"
          :style="{
            left: FRAGMENT_POS[c.id].x + '%',
            top: FRAGMENT_POS[c.id].y + '%',
            width: 'clamp(46px, 10.5%, 72px)',
          }"
          @select="selectFragment"
        />

        <!-- 皇冠：导航入口 -->
        <button
          type="button"
          class="crown"
          aria-label="打开皇冠导航"
          @click="navOpen = true"
        >
          <svg :viewBox="CROWN_VIEWBOX" aria-hidden="true">
            <path :d="CROWN_BODY" fill="var(--yellow)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" />
            <path :d="CROWN_BAND" fill="var(--orange)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" />
          </svg>
          <span class="count">{{ progress.litCount }}/7</span>
        </button>
      </div>

      <p class="hint">点击皇冠选择板块 · 点亮碎片，拼回完整皇冠</p>
    </div>

    <!-- 回场提示 -->
    <Transition name="toast">
      <p v-if="toast" class="toast" role="status">{{ toast }}</p>
    </Transition>

    <CrownNav :open="navOpen" @close="navOpen = false" />
  </div>
</template>

<style scoped>
.home {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
}
.room-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
}
.room {
  position: relative;
  width: min(92vw, 1040px);
  aspect-ratio: 16 / 10;
  border-radius: var(--r-panel);
  border: 3px solid var(--rule);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  background: var(--bg2);
}

/* 房间底图：草绿墙 + 暖木地板 + 窗光（全部由令牌色派生） */
.room-bg {
  position: absolute;
  inset: 0;
  z-index: var(--z-room-bg);
  background:
    radial-gradient(circle at 26% 16%, rgba(255, 248, 231, 0.9) 0%, rgba(255, 248, 231, 0) 34%),
    linear-gradient(180deg, transparent 0 64%, rgba(51, 64, 42, 0.16) 64% 67%, #E4C274 67% 100%),
    linear-gradient(180deg, #A9CD7F 0%, var(--green) 100%);
}

.layer {
  z-index: var(--z-sparkles);
}

/* 皇冠 */
.crown {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-crown);
  width: clamp(72px, 14%, 104px);
  /* 用固定 padding：百分比 padding 会按 .room 宽度解析，窄屏会把 SVG 挤扁 */
  padding: 0.5rem 0.4rem 0.3rem;
  background: var(--cream);
  border: 3px solid var(--ink);
  border-radius: 18px 6px 18px 6px;
  box-shadow: var(--shadow-pop);
  cursor: pointer;
  transition: transform 0.3s var(--ease-pop);
}
.crown:hover,
.crown:focus-visible {
  transform: translate(-50%, -50%) scale(1.06) rotate(-2deg);
  outline: none;
}
.crown svg {
  display: block;
  width: 100%;
}
.count {
  position: absolute;
  left: 50%;
  bottom: -12px;
  transform: translateX(-50%);
  padding: 0.05rem 0.6rem;
  background: var(--ink);
  color: var(--cream);
  border-radius: 999px;
  font-family: var(--f-num);
  font-weight: 700;
  font-size: 0.72rem;
  white-space: nowrap;
}

.hint {
  color: var(--muted);
  font-size: 0.85rem;
  margin: 0;
  text-align: center;
}

/* 回场提示 */
.toast {
  position: fixed;
  left: 50%;
  bottom: 6vh;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.5rem 1.3rem;
  background: var(--cream);
  border: 2px solid var(--orange);
  border-radius: 999px;
  box-shadow: var(--shadow-pop);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
  z-index: 60;
  pointer-events: none;
}
.toast-enter-active { transition: opacity 0.35s var(--ease-pop), transform 0.35s var(--ease-pop); }
.toast-leave-active { transition: opacity 0.3s; }
.toast-enter-from { opacity: 0; transform: translate(-50%, 12px); }
.toast-leave-to { opacity: 0; }
</style>
