<script setup lang="ts">
/**
 * 00 开屏（技术方案 §05 / M2）
 * LOGO 中文字逐字「写入」（clip-path 揭示，交错 0.18s）+ 手绘下划线描边
 * 每个会话只播放一次；跳过后进入首页；皇冠导航可「重新观看」
 */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const INTRO_KEY = 'pe-intro-seen'

const route = useRoute()
const router = useRouter()

const show = ref(false) // 首帧不渲染，避免跳转时闪一下
const chars = ['纸', '境', '回', '响']

onMounted(() => {
  const replay = route.query.replay === '1'
  if (!replay && sessionStorage.getItem(INTRO_KEY)) {
    router.replace('/home')
    return
  }
  show.value = true
})

function enter() {
  sessionStorage.setItem(INTRO_KEY, '1')
  router.replace('/home')
}
</script>

<template>
  <div v-if="show" class="intro">
    <button type="button" class="skip" @click="enter">跳过 ⏩</button>

    <div class="logo">
      <p class="en">PAPER ECHO</p>
      <h1 class="cn" aria-label="纸境回响">
        <span
          v-for="(ch, i) in chars"
          :key="i"
          class="char"
          :style="{ animationDelay: 0.15 + i * 0.18 + 's' }"
          aria-hidden="true"
        >{{ ch }}</span>
      </h1>
      <svg class="pen" viewBox="0 0 220 10" aria-hidden="true">
        <path
          d="M3 6 Q 20 1, 40 6 T 80 6 T 120 5 T 160 7 T 217 5"
          fill="none"
          stroke="var(--orange)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <p class="tag">收集记忆碎片，拼回完整的皇冠</p>
    <button type="button" class="btn-primary enter" @click="enter">进入纸境</button>
  </div>
</template>

<style scoped>
.intro {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 30%, rgba(245, 200, 66, 0.16), transparent 55%),
    var(--bg);
}

.skip {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  padding: 0.35rem 1rem;
  background: var(--bg2);
  border: 2px dashed var(--locked-line);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--muted);
  cursor: pointer;
  animation: fade 0.5s 1.4s both;
}
.skip:hover {
  color: var(--ink);
  border-color: var(--orange);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.en {
  font-family: var(--f-num);
  letter-spacing: 0.35em;
  text-indent: 0.35em;
  color: var(--orange);
  font-weight: 700;
  margin: 0;
  animation: fade 0.6s both;
}
.cn {
  font-family: var(--f-title);
  font-size: clamp(2.4rem, 9vw, 4rem);
  letter-spacing: 0.3em;
  margin: 0.3rem 0 0;
  color: var(--ink);
  display: flex;
}
/* 逐字「写入」 */
.char {
  display: inline-block;
  animation: write 0.6s ease-out both;
}
.pen {
  width: min(220px, 60vw);
  height: 10px;
  margin-top: 0.2rem;
}
.pen path {
  stroke-dasharray: 240;
  stroke-dashoffset: 240;
  animation: draw 0.9s 0.95s ease-out forwards;
}

.tag {
  color: var(--muted);
  margin: 0.2rem 0 1.2rem;
  animation: fade 0.7s 1.3s both;
}
.enter {
  animation: fade 0.7s 1.55s both;
}

@keyframes write {
  0% { clip-path: inset(0 100% 0 0); opacity: 0; }
  35% { opacity: 1; }
  100% { clip-path: inset(0 0 0 0); opacity: 1; }
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@keyframes fade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .char, .pen path, .en, .tag, .enter, .skip {
    animation-duration: 1ms !important;
    animation-delay: 0s !important;
  }
  .pen path { stroke-dashoffset: 0; }
}
</style>
