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
        <!-- 元元头戴的软塑皇冠：三圆尖 + 橙色冠带，立体造型 -->
        <svg class="crown m-pop-center" viewBox="0 0 100 88" aria-hidden="true">
          <defs>
            <linearGradient id="mg-face" x1="0.12" y1="0" x2="0.45" y2="1">
              <stop offset="0" stop-color="#FFF9DC" />
              <stop offset="0.28" stop-color="#FFE9A2" />
              <stop offset="0.6" stop-color="#FBD269" />
              <stop offset="1" stop-color="#EDB244" />
            </linearGradient>
            <linearGradient id="mg-band" x1="0" y1="0" x2="0.16" y2="1">
              <stop offset="0" stop-color="#FFE7A8" />
              <stop offset="0.42" stop-color="#F8C96C" />
              <stop offset="1" stop-color="#DE9F3D" />
            </linearGradient>
            <linearGradient id="mg-shade" x1="0.28" y1="0" x2="1" y2="0">
              <stop offset="0.42" stop-color="#D9902F" stop-opacity="0" />
              <stop offset="1" stop-color="#C57C22" stop-opacity="0.42" />
            </linearGradient>
            <filter id="mg-soft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            <filter id="mg-soft-lite" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
            <clipPath id="mg-clip-body">
              <path d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z" />
            </clipPath>
            <clipPath id="mg-clip-band">
              <rect x="14" y="50" width="72" height="18" rx="7.5" />
            </clipPath>
          </defs>

          <!-- 落影 -->
          <ellipse cx="52" cy="82" rx="36" ry="3" fill="#93A9C4" opacity="0.22" filter="url(#mg-soft)" />
          <!-- 冠体侧面厚度 -->
          <path
            d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z"
            fill="#D9902F"
            transform="translate(3 5)"
          />
          <!-- 冠带侧面厚度 -->
          <rect x="14" y="50" width="72" height="18" rx="7.5" fill="#C9802A" transform="translate(3 4.5)" />
          <!-- 冠体正面 + 明暗（裁切在冠体内） -->
          <g clip-path="url(#mg-clip-body)">
            <path
              d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z"
              fill="url(#mg-face)"
            />
            <!-- 右侧体积暗面 -->
            <path
              d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z"
              fill="url(#mg-shade)"
            />
            <!-- 山谷内侧暗部 -->
            <path d="M29 42 C30 37 31 33 32 29" fill="none" stroke="#DE9E34" stroke-width="5" stroke-linecap="round" opacity="0.2" filter="url(#mg-soft)" />
            <path d="M63 41 C64 36 65 32 66 28" fill="none" stroke="#DE9E34" stroke-width="4" stroke-linecap="round" opacity="0.16" filter="url(#mg-soft)" />
            <!-- 中央尖角高光 -->
            <ellipse cx="48" cy="22" rx="6.5" ry="10" fill="#FFFDF4" opacity="0.55" transform="rotate(-8 48 22)" filter="url(#mg-soft)" />
            <!-- 左尖轮廓光 -->
            <path d="M12 44 C11 37 13 30 18 27" fill="none" stroke="#FFFBEC" stroke-width="2" stroke-linecap="round" opacity="0.55" filter="url(#mg-soft-lite)" />
            <!-- 右尖高光 -->
            <ellipse cx="84" cy="22" rx="2.4" ry="4" fill="#FFFDF4" opacity="0.4" transform="rotate(-14 84 22)" filter="url(#mg-soft-lite)" />
          </g>
          <!-- 冠体轮廓 -->
          <path
            d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z"
            fill="none"
            stroke="#E8AC46"
            stroke-width="1"
            stroke-linejoin="round"
          />
          <!-- 冠带正面 + 明暗 -->
          <g clip-path="url(#mg-clip-band)">
            <rect x="14" y="50" width="72" height="18" rx="7.5" fill="url(#mg-band)" />
            <!-- 冠带接缝暗部 -->
            <path d="M18 63 C34 67 66 67 82 63" fill="none" stroke="#D2922F" stroke-width="5" opacity="0.28" filter="url(#mg-soft)" />
            <!-- 冠带顶部亮边 -->
            <path d="M18 55 C34 51 66 51 82 55" fill="none" stroke="#FFF6D8" stroke-width="3.2" stroke-linecap="round" opacity="0.6" filter="url(#mg-soft-lite)" />
            <!-- 冠带左下反光 -->
            <ellipse cx="30" cy="63" rx="10" ry="2.4" fill="#FFEDBE" opacity="0.4" filter="url(#mg-soft)" />
          </g>
          <!-- 冠带轮廓 -->
          <rect x="14" y="50" width="72" height="18" rx="7.5" fill="none" stroke="#E4A64A" stroke-width="1" />
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
