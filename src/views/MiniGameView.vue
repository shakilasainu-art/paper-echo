<script setup lang="ts">
/**
 * 07 记忆跃迁：蓝白派对迷宫
 * 沿固定路线收集七块碎片，避开周期地刺并抵达终点。
 */
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { GAME_TOTAL, createGame, type Dir, type GameHandle } from '../game/engine'
import { useProgress } from '../stores/progress'
import HudSlots from '../components/HudSlots.vue'

const router = useRouter()
const progress = useProgress()
const canvasEl = ref<HTMLCanvasElement | null>(null)
const game = shallowRef<GameHandle | null>(null)
const phase = ref<'intro' | 'playing' | 'merging'>('intro')
const collected = ref(0)
const hits = ref(0)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let routeTimer = 0

const played = computed(() => progress.data.gameCompleted)
const statusText = computed(() => {
  if (phase.value === 'merging') return '七块记忆集齐，派对皇冠正在拼合。'
  if (hits.value > 0) return `碰刺 ${hits.value} 次 · 已回到最近碎片，收集进度保留`
  return '沿白色路线收集碎片，等地刺缩回再通过。'
})

function start() {
  if (!canvasEl.value) return
  game.value?.destroy()
  collected.value = 0
  hits.value = 0
  phase.value = 'playing'
  game.value = createGame(canvasEl.value, {
    onCollect(n) {
      collected.value = n
    },
    onHit(n) {
      hits.value = n
    },
    onWin() {
      collected.value = GAME_TOTAL
      phase.value = 'merging'
      progress.completeGame()
      routeTimer = window.setTimeout(
        () => router.push('/ending'),
        reduced ? 500 : 1500,
      )
    },
  })
}

function press(dir: Dir, on: boolean) {
  game.value?.setInput(dir, on)
}

function hold(e: PointerEvent, dir: Dir) {
  const el = e.currentTarget as HTMLElement | null
  try {
    el?.setPointerCapture?.(e.pointerId)
  } catch {
    /* 合成事件或指针已释放时忽略 */
  }
  press(dir, true)
}

function releaseAll() {
  press('up', false)
  press('down', false)
  press('left', false)
  press('right', false)
}

onMounted(() => {
  window.addEventListener('pointerup', releaseAll)
  window.addEventListener('pointercancel', releaseAll)
})

onBeforeUnmount(() => {
  window.clearTimeout(routeTimer)
  window.removeEventListener('pointerup', releaseAll)
  window.removeEventListener('pointercancel', releaseAll)
  game.value?.destroy()
  game.value = null
})
</script>

<template>
  <div class="game">
    <header class="head m-rise">
      <button type="button" class="back" @click="router.push('/home')">◀ 返回首页</button>
      <h1>07 · 记忆跃迁 <span aria-hidden="true">✨</span></h1>
    </header>

    <div class="hud">
      <HudSlots :lit="collected" :total="GAME_TOTAL" />
      <p class="count" role="status">
        已收集 <b>{{ collected }}</b> / {{ GAME_TOTAL }}
      </p>
    </div>

    <div class="stage">
      <canvas
        ref="canvasEl"
        class="board"
        role="img"
        aria-label="横版蓝白派对迷宫：操控蓝耳皇冠小狗，沿白色路线收集七块碎片，避开地刺并抵达终点"
      ></canvas>

      <div v-if="phase === 'intro'" class="overlay">
        <p class="eyebrow">BLUE PARTY · 07</p>
        <h2>记忆跃迁迷宫</h2>
        <p class="desc">
          沿白色派对路线前进，收集七块碎片，<br />
          再抵达右下角 FINISH，拼合元元的皇冠。
        </p>
        <div class="keys" aria-hidden="true">
          <span class="key">← ↑ ↓ →</span>
          <span class="key">W A S D</span>
          <span class="key">触屏方向键</span>
        </div>
        <button type="button" class="btn-primary" @click="start">
          {{ played ? '再玩一次' : '进入派对迷宫' }}
        </button>
        <button v-if="played" type="button" class="link" @click="router.push('/ending')">
          直接查看结局 →
        </button>
        <p class="tip">地刺缩回时通过；碰刺只回到最近碎片，不会丢失收集进度。</p>
      </div>

      <div v-else-if="phase === 'merging'" class="overlay merge" role="status">
        <!-- 元元头戴的软塑皇冠：三个圆润尖角 + 底部圆环冠带，立体造型 -->
        <svg class="crown m-pop-center" viewBox="0 0 100 94" aria-hidden="true">
          <defs>
            <linearGradient id="mg-face" x1="0.12" y1="0" x2="0.44" y2="1">
              <stop offset="0" stop-color="#FFF8D2" />
              <stop offset="0.26" stop-color="#FFE68C" />
              <stop offset="0.58" stop-color="#FAD158" />
              <stop offset="1" stop-color="#EEB033" />
            </linearGradient>
            <linearGradient id="mg-band" x1="0" y1="0" x2="0.18" y2="1">
              <stop offset="0" stop-color="#FFEDA6" />
              <stop offset="0.44" stop-color="#FAD055" />
              <stop offset="1" stop-color="#E3A32C" />
            </linearGradient>
            <linearGradient id="mg-shade" x1="0.3" y1="0" x2="1" y2="0">
              <stop offset="0.45" stop-color="#D6841A" stop-opacity="0" />
              <stop offset="1" stop-color="#C07418" stop-opacity="0.34" />
            </linearGradient>
            <filter id="mg-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
            <filter id="mg-soft-lite" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
            <clipPath id="mg-clip-body">
              <path d="M6 72 C4 62 4 54 7 47 C8 38 10 27 20 25 C28 23 31 32 31 42 C31 46 33 48 36 48 L40 48 C41 38 40 22 46 13 C50 7 58 8 60 16 C62 26 61 40 63 46 L70 46 C73 40 74 26 80 18 C84 11 91 13 92 22 C93 32 93 52 94 72 Z" />
            </clipPath>
            <clipPath id="mg-clip-band">
              <path d="M8 70 C8 67 14 65 22 65 L78 65 C86 65 92 67 92 70 L92 75 C92 79 87 81 78 81 Q50 85 22 81 C13 81 8 79 8 75 Z" />
            </clipPath>
          </defs>

          <!-- 落影 -->
          <ellipse cx="52" cy="86" rx="36" ry="3.2" fill="#8FA6C8" opacity="0.2" filter="url(#mg-soft)" />
          <!-- 冠体侧面厚度 -->
          <path
            d="M6 72 C4 62 4 54 7 47 C8 38 10 27 20 25 C28 23 31 32 31 42 C31 46 33 48 36 48 L40 48 C41 38 40 22 46 13 C50 7 58 8 60 16 C62 26 61 40 63 46 L70 46 C73 40 74 26 80 18 C84 11 91 13 92 22 C93 32 93 52 94 72 Z"
            fill="#C87A18"
            transform="translate(3 6)"
          />
          <!-- 冠带侧面厚度 -->
          <path
            d="M8 70 C8 67 14 65 22 65 L78 65 C86 65 92 67 92 70 L92 75 C92 79 87 81 78 81 Q50 85 22 81 C13 81 8 79 8 75 Z"
            fill="#B06C18"
            transform="translate(2.5 4.5)"
          />
          <!-- 冠体正面 + 明暗（裁切在冠体内） -->
          <g clip-path="url(#mg-clip-body)">
            <path
              d="M6 72 C4 62 4 54 7 47 C8 38 10 27 20 25 C28 23 31 32 31 42 C31 46 33 48 36 48 L40 48 C41 38 40 22 46 13 C50 7 58 8 60 16 C62 26 61 40 63 46 L70 46 C73 40 74 26 80 18 C84 11 91 13 92 22 C93 32 93 52 94 72 Z"
              fill="url(#mg-face)"
            />
            <!-- 右侧体积暗面 -->
            <path
              d="M6 72 C4 62 4 54 7 47 C8 38 10 27 20 25 C28 23 31 32 31 42 C31 46 33 48 36 48 L40 48 C41 38 40 22 46 13 C50 7 58 8 60 16 C62 26 61 40 63 46 L70 46 C73 40 74 26 80 18 C84 11 91 13 92 22 C93 32 93 52 94 72 Z"
              fill="url(#mg-shade)"
            />
            <!-- 尖角内侧暗部 -->
            <path d="M32 44 C32 38 32 32 33 28" fill="none" stroke="#D99B26" stroke-width="6" stroke-linecap="round" opacity="0.16" filter="url(#mg-soft)" />
            <path d="M63 44 C64 38 65 34 66 30" fill="none" stroke="#D99B26" stroke-width="5" stroke-linecap="round" opacity="0.13" filter="url(#mg-soft)" />
            <!-- 中央尖角高光 -->
            <ellipse cx="51" cy="26" rx="7.5" ry="10" fill="#FFFDF2" opacity="0.48" transform="rotate(-8 51 26)" filter="url(#mg-soft)" />
            <!-- 左侧尖角轮廓光 -->
            <path d="M10 50 C9 40 12 32 17 28" fill="none" stroke="#FFF9E2" stroke-width="2" stroke-linecap="round" opacity="0.5" filter="url(#mg-soft-lite)" />
            <!-- 右侧尖角高光 -->
            <ellipse cx="85" cy="22" rx="2.6" ry="3.6" fill="#FFFDF2" opacity="0.4" transform="rotate(-16 85 22)" filter="url(#mg-soft-lite)" />
          </g>
          <!-- 冠体轮廓 -->
          <path
            d="M6 72 C4 62 4 54 7 47 C8 38 10 27 20 25 C28 23 31 32 31 42 C31 46 33 48 36 48 L40 48 C41 38 40 22 46 13 C50 7 58 8 60 16 C62 26 61 40 63 46 L70 46 C73 40 74 26 80 18 C84 11 91 13 92 22 C93 32 93 52 94 72 Z"
            fill="none"
            stroke="#F2C058"
            stroke-width="0.8"
            stroke-linejoin="round"
          />
          <!-- 冠带正面 + 明暗 -->
          <g clip-path="url(#mg-clip-band)">
            <path
              d="M8 70 C8 67 14 65 22 65 L78 65 C86 65 92 67 92 70 L92 75 C92 79 87 81 78 81 Q50 85 22 81 C13 81 8 79 8 75 Z"
              fill="url(#mg-band)"
            />
            <!-- 冠带接缝暗部 -->
            <path d="M13 67 C32 71 68 71 87 67" fill="none" stroke="#CE8F1F" stroke-width="3" opacity="0.26" filter="url(#mg-soft)" />
            <!-- 冠带顶部亮边 -->
            <path d="M13 69.5 C30 65.5 70 65.5 87 69.5" fill="none" stroke="#FFF5CE" stroke-width="2.2" stroke-linecap="round" opacity="0.72" filter="url(#mg-soft-lite)" />
            <!-- 冠带左下反光 -->
            <ellipse cx="23" cy="76" rx="9" ry="2.2" fill="#FFEDB0" opacity="0.4" filter="url(#mg-soft)" />
          </g>
          <!-- 冠带轮廓 -->
          <path
            d="M8 70 C8 67 14 65 22 65 L78 65 C86 65 92 67 92 70 L92 75 C92 79 87 81 78 81 Q50 85 22 81 C13 81 8 79 8 75 Z"
            fill="none"
            stroke="#E7AE38"
            stroke-width="0.9"
          />
        </svg>
        <h2>皇冠正在拼合…</h2>
        <p class="desc">七块记忆都回来了，蓝白派对的灯正在聚拢。</p>
      </div>
    </div>

    <div class="dpad" aria-label="虚拟方向键">
      <button type="button" class="up" aria-label="向上" @pointerdown.prevent="hold($event, 'up')" @pointerup="press('up', false)" @pointercancel="press('up', false)" @lostpointercapture="press('up', false)">▲</button>
      <button type="button" class="left" aria-label="向左" @pointerdown.prevent="hold($event, 'left')" @pointerup="press('left', false)" @pointercancel="press('left', false)" @lostpointercapture="press('left', false)">◀</button>
      <button type="button" class="right" aria-label="向右" @pointerdown.prevent="hold($event, 'right')" @pointerup="press('right', false)" @pointercancel="press('right', false)" @lostpointercapture="press('right', false)">▶</button>
      <button type="button" class="down" aria-label="向下" @pointerdown.prevent="hold($event, 'down')" @pointerup="press('down', false)" @pointercancel="press('down', false)" @lostpointercapture="press('down', false)">▼</button>
    </div>

    <p class="foot-note" role="status">{{ statusText }}</p>
  </div>
</template>

<style scoped>
.game {
  min-height: 100dvh;
  max-width: 980px;
  margin: 0 auto;
  padding: 1.2rem 1rem 2rem;
  display: flex;
  flex-direction: column;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 2px dashed var(--sky);
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}
.head h1 {
  font-family: var(--f-title);
  color: var(--party-deep);
  font-size: 1.3rem;
  margin: 0;
  text-align: right;
}
.back {
  padding: 0.4rem 1rem;
  background: var(--party-pale);
  border: 2.5px solid var(--party-deep);
  border-radius: var(--r-btn);
  box-shadow: 3px 3px 0 var(--sky);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--party-deep);
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop);
  white-space: nowrap;
}
.back:hover { transform: translateY(-3px); }

.hud {
  width: 100%;
  max-width: 900px;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.count {
  margin: 0;
  font-size: 0.8rem;
  color: var(--party-deep);
  font-family: var(--f-num);
  white-space: nowrap;
}
.count b { font-size: 1rem; }

.stage {
  position: relative;
  width: 100%;
  max-width: 900px;
  aspect-ratio: 20 / 13;
  align-self: center;
  border: 3px solid var(--party-deep);
  border-radius: var(--r-panel);
  box-shadow: 5px 6px 0 var(--sky);
  overflow: hidden;
  background: var(--party-pale);
  touch-action: none;
}
.board {
  display: block;
  width: 100%;
  height: 100%;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 1.2rem 1.4rem;
  text-align: center;
  background: var(--party-pale);
  border-radius: inherit;
}
.eyebrow {
  margin: 0;
  padding: 0.2rem 0.75rem;
  border: 1.5px dashed var(--sky);
  border-radius: 999px;
  background: var(--bg2);
  font-family: var(--f-num);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: var(--party-deep);
}
.overlay h2 {
  font-family: var(--f-title);
  color: var(--party-deep);
  font-size: 1.65rem;
  margin: 0;
}
.desc {
  margin: 0;
  color: var(--party-deep);
  font-size: 0.85rem;
  line-height: 1.75;
}
.keys {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin: 0.2rem 0 0.3rem;
}
.key {
  padding: 0.12rem 0.6rem;
  background: var(--bg2);
  border: 1.5px dashed var(--sky);
  border-radius: 8px;
  font-family: var(--f-num);
  font-size: 0.74rem;
  color: var(--party-deep);
}
.overlay .btn-primary {
  background: var(--bg2);
  border-color: var(--party-deep);
  color: var(--party-deep);
  box-shadow: 3px 3px 0 var(--sky);
}
.link {
  background: none;
  border: none;
  border-bottom: 1.5px dashed var(--sky);
  padding: 0.1rem 0.2rem;
  color: var(--party-deep);
  font-size: 0.78rem;
  cursor: pointer;
}
.tip {
  max-width: 300px;
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: var(--party-deep);
  line-height: 1.65;
}
.merge .crown { width: 140px; }
.merge h2 { font-size: 1.25rem; }

.dpad {
  display: none;
  width: min(180px, 50vw);
  margin: 1rem auto 0;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.dpad button {
  aspect-ratio: 1;
  padding: 0;
  background: var(--party-pale);
  border: 2.5px solid var(--party-deep);
  border-radius: 12px 4px 12px 4px;
  box-shadow: 3px 3px 0 var(--sky);
  font-size: 1rem;
  color: var(--party-deep);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s, box-shadow 0.1s;
}
.dpad button:active {
  transform: translateY(2px);
  box-shadow: 1px 1px 0 var(--sky);
}
.dpad .up { grid-area: 1 / 2; }
.dpad .left { grid-area: 2 / 1; }
.dpad .right { grid-area: 2 / 3; }
.dpad .down { grid-area: 3 / 2; }

.foot-note {
  margin: 1rem auto 0;
  text-align: center;
  font-size: 0.76rem;
  color: var(--party-deep);
}

@media (hover: none), (max-width: 760px) {
  .dpad { display: grid; }
  .stage { max-width: 100%; }
  .overlay { padding: 0.9rem 1rem; gap: 0.45rem; }
  .overlay h2 { font-size: 1.35rem; }
  .desc { font-size: 0.8rem; }
  .dpad { margin-top: 0.8rem; }
}

@media (max-width: 480px) {
  .game { padding: 0.9rem 0.75rem 1.5rem; }
  .head h1 { font-size: 1.05rem; }
  .back { padding: 0.35rem 0.7rem; font-size: 0.76rem; }
  .hud { gap: 0.45rem; }
  .hud :deep(.hud) { gap: 0.3rem; }
  .hud :deep(.slot) { width: 26px; height: 26px; }
  .count { font-size: 0.72rem; }
  .overlay { padding: 0.45rem 0.7rem; gap: 0.28rem; }
  .merge .crown { width: 112px; }
  .overlay h2 { font-size: 1.05rem; }
  .eyebrow { padding: 0.1rem 0.5rem; font-size: 0.58rem; }
  .desc { font-size: 0.7rem; line-height: 1.45; }
  .keys, .tip { display: none; }
  .overlay .btn-primary { padding: 0.35rem 0.9rem; font-size: 0.78rem; }
  .link { font-size: 0.68rem; }
}
</style>
