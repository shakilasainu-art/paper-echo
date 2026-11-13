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
        <svg class="crown m-pop-center" viewBox="0 0 100 70" aria-hidden="true">
          <path
            d="M8 58 L14 16 L33 36 L50 8 L67 36 L86 16 L92 58 Q50 66 8 58 Z"
            fill="var(--yellow)"
            stroke="var(--party-deep)"
            stroke-width="4"
            stroke-linejoin="round"
          />
          <circle cx="24" cy="48" r="4" fill="var(--orange)" />
          <circle cx="50" cy="46" r="4" fill="var(--green)" />
          <circle cx="76" cy="48" r="4" fill="var(--sky)" />
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
.merge .crown { width: 110px; }
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
  .overlay h2 { font-size: 1.05rem; }
  .eyebrow { padding: 0.1rem 0.5rem; font-size: 0.58rem; }
  .desc { font-size: 0.7rem; line-height: 1.45; }
  .keys, .tip { display: none; }
  .overlay .btn-primary { padding: 0.35rem 0.9rem; font-size: 0.78rem; }
  .link { font-size: 0.68rem; }
}
</style>
