<script setup lang="ts">
/**
 * 00 开屏
 * 第一幕：皇冠短片（静音自动播放，播完或跳过后进入第二幕）
 * 第二幕：六块金色皇冠碎片漂浮在空中，中央留一块暗淡空缺，随后 LOGO 与进入按钮浮现
 * 每个会话只播放一次；?replay=1 可重看
 */
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const INTRO_KEY = 'pe-intro-seen'
const crownVideo = new URL('../assets/video/crown-intro.mp4', import.meta.url).href
const poster = new URL('../assets/img/pe_intro_crown_poster.webp', import.meta.url).href

const route = useRoute()
const router = useRouter()

const show = ref(false) // 首帧不渲染，避免跳转时闪一下
const phase = ref<'video' | 'crown'>('video')
const chars = ['纸', '境', '回', '响']
const videoEl = ref<HTMLVideoElement | null>(null)

function toCrown() {
  phase.value = 'crown'
}

onMounted(() => {
  const replay = route.query.replay === '1'
  if (!replay && sessionStorage.getItem(INTRO_KEY)) {
    router.replace('/home')
    return
  }
  show.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    toCrown()
    return
  }
  nextTick(() => {
    videoEl.value?.play().catch(toCrown)
  })
})

function enter() {
  sessionStorage.setItem(INTRO_KEY, '1')
  router.replace('/home')
}
</script>

<template>
  <div v-if="show" class="intro">
    <button v-if="phase === 'video'" type="button" class="skip" @click="toCrown">
      跳过动画 ⏩
    </button>

    <div class="stage">
      <!-- 第一幕：皇冠短片 -->
      <video
        v-if="phase === 'video'"
        ref="videoEl"
        class="film"
        :src="crownVideo"
        :poster="poster"
        autoplay
        muted
        playsinline
        preload="auto"
        @ended="toCrown"
        @error="toCrown"
      ></video>

      <!-- 第二幕：六块碎片 + 一块空缺 -->
      <div v-else class="crown-wrap">
        <svg
          class="crown"
          viewBox="0 0 320 250"
          role="img"
          aria-label="六块金色皇冠碎片悬浮在空中，皇冠中央还缺着一块暗淡的碎片"
        >
          <defs>
            <linearGradient id="pe-gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFF0BE" />
              <stop offset="0.42" stop-color="#F8CF55" />
              <stop offset="1" stop-color="#DE9F26" />
            </linearGradient>
          </defs>

          <!-- 左尖 -->
          <g class="frag" style="--i: 0; --x: -5px; --y: -5px; --r: -4deg; --sx: -18px; --sy: -26px">
            <g class="bob">
              <path class="shard" d="M62 158 C 68 126, 76 104, 86 96 C 96 104, 104 128, 112 158 Z" />
            </g>
          </g>
          <!-- 中尖 -->
          <g class="frag" style="--i: 1; --x: 0px; --y: -9px; --r: 0deg; --sx: 0px; --sy: -32px">
            <g class="bob">
              <path class="shard" d="M132 158 C 140 116, 148 82, 160 72 C 172 82, 180 116, 188 158 Z" />
            </g>
          </g>
          <!-- 右尖 -->
          <g class="frag" style="--i: 2; --x: 5px; --y: -5px; --r: 4deg; --sx: 18px; --sy: -26px">
            <g class="bob">
              <path class="shard" d="M208 158 C 216 128, 224 104, 234 96 C 244 104, 250 126, 258 158 Z" />
            </g>
          </g>
          <!-- 冠带左 -->
          <g class="frag" style="--i: 3; --x: -7px; --y: 3px; --r: -2deg; --sx: -24px; --sy: 16px">
            <g class="bob">
              <rect class="shard" x="50" y="150" width="68" height="46" rx="13" />
            </g>
          </g>
          <!-- 冠带中 -->
          <g class="frag" style="--i: 4; --x: 0px; --y: 5px; --r: 0deg; --sx: 0px; --sy: 22px">
            <g class="bob">
              <rect class="shard" x="120" y="150" width="80" height="46" rx="13" />
            </g>
          </g>
          <!-- 冠带右 -->
          <g class="frag" style="--i: 5; --x: 7px; --y: 3px; --r: 2deg; --sx: 24px; --sy: 16px">
            <g class="bob">
              <rect class="shard" x="202" y="150" width="68" height="46" rx="13" />
            </g>
          </g>
          <!-- 空缺碎片 -->
          <g class="frag empty" style="--i: 6; --x: 0px; --y: 5px; --r: 0deg; --sx: 0px; --sy: -18px">
            <g class="bob">
              <circle class="void" cx="160" cy="173" r="16" />
            </g>
          </g>

          <!-- 星点 -->
          <g aria-hidden="true">
            <circle class="spark" style="--i: 0" cx="46" cy="82" r="2.6" />
            <circle class="spark" style="--i: 1" cx="274" cy="70" r="2.1" />
            <circle class="spark" style="--i: 2" cx="94" cy="42" r="2.3" />
            <circle class="spark" style="--i: 3" cx="232" cy="38" r="2.7" />
            <circle class="spark" style="--i: 4" cx="40" cy="192" r="2" />
            <circle class="spark" style="--i: 5" cx="288" cy="166" r="2.4" />
          </g>
        </svg>
      </div>
    </div>

    <template v-if="phase === 'crown'">
      <div class="logo">
        <p class="en">PAPER ECHO</p>
        <h1 class="cn" aria-label="纸境回响">
          <span
            v-for="(ch, i) in chars"
            :key="i"
            class="char"
            :style="{ animationDelay: 0.2 + i * 0.16 + 's' }"
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
    </template>
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
    radial-gradient(circle at 50% 32%, rgba(245, 200, 66, 0.16), transparent 55%),
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
  animation: fade 0.5s 1.2s both;
}
.skip:hover {
  color: var(--ink);
  border-color: var(--orange);
}

/* 两幕共用的舞台，避免高度跳动 */
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(260px, 46vh, 440px);
}

/* 第一幕：短片 */
.film {
  width: min(88vw, 460px);
  aspect-ratio: 1;
  object-fit: cover;
  background: #e6efd8;
  border: 3px solid var(--ink);
  border-radius: 26px;
  box-shadow: var(--shadow-pop), 0 18px 40px rgba(51, 64, 42, 0.16);
  animation: film-in 0.6s ease both;
}
@keyframes film-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: none; }
}

/* 第二幕：碎片皇冠 */
.crown-wrap {
  position: relative;
  display: grid;
  place-items: center;
}
.crown-wrap::before {
  content: '';
  position: absolute;
  width: 72%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 200, 66, 0.3), transparent 68%);
  filter: blur(8px);
  pointer-events: none;
}
.crown {
  position: relative;
  width: min(82vw, 440px);
  height: auto;
  filter: drop-shadow(0 12px 20px rgba(51, 64, 42, 0.14));
}

.frag {
  transform-box: fill-box;
  transform-origin: center;
  animation: frag-in 0.62s var(--ease-pop) both;
  animation-delay: calc(0.1s + var(--i) * 0.085s);
}
.shard {
  fill: url(#pe-gold);
  stroke: #c98a1e;
  stroke-width: 2;
  filter: drop-shadow(0 4px 5px rgba(222, 159, 38, 0.35));
}
.void {
  fill: rgba(51, 64, 42, 0.14);
  stroke: #9a937c;
  stroke-width: 3;
  stroke-dasharray: 5 4;
  animation: void-pulse 2.8s ease-in-out infinite;
}

.bob {
  transform-box: fill-box;
  transform-origin: center;
  animation: bob 3.8s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.42s);
}

.spark {
  fill: var(--yellow);
  transform-box: fill-box;
  transform-origin: center;
  animation: twinkle 2.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.37s);
}

@keyframes frag-in {
  from {
    opacity: 0;
    transform: translate(calc(var(--x) + var(--sx, 0px)), calc(var(--y) + var(--sy, 0px)))
      scale(0.45) rotate(var(--r));
  }
  to {
    opacity: 1;
    transform: translate(var(--x), var(--y)) scale(1) rotate(var(--r));
  }
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(1.4deg); }
}
@keyframes void-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.95; }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* LOGO */
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
  animation: draw 0.9s 0.85s ease-out forwards;
}

.tag {
  color: var(--muted);
  margin: 0.2rem 0 1.2rem;
  animation: fade 0.7s 1s both;
}
.enter {
  animation: fade 0.7s 1.2s both;
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

@media (max-width: 560px) {
  .stage {
    min-height: clamp(240px, 42vh, 340px);
  }
  .film {
    width: min(90vw, 360px);
    border-radius: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .char, .pen path, .en, .tag, .enter, .skip, .film {
    animation-duration: 1ms !important;
    animation-delay: 0s !important;
  }
  .pen path { stroke-dashoffset: 0; }
  .frag, .bob, .spark, .void {
    animation-duration: 1ms !important;
    animation-delay: 0s !important;
  }
}
</style>
