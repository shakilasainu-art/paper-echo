<script setup lang="ts">
/**
 * 07 记忆跃迁（技术方案 §05）
 * Canvas 收集小游戏：方向键 / WASD / 触屏虚拟方向键
 * 集满 7 块 → 皇冠拼合 → 写入存档 → 直达结局
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
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let routeTimer = 0

const played = computed(() => progress.data.gameCompleted)

function start() {
  if (!canvasEl.value) return
  game.value?.destroy()
  collected.value = 0
  phase.value = 'playing'
  game.value = createGame(canvasEl.value, {
    onCollect(n) {
      collected.value = n
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

/** 指针在任何位置抬起都清空输入，避免虚拟键卡住 */
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
        aria-label="记忆跃迁游戏画面：操控纸偶收集散落的记忆碎片"
      ></canvas>

      <!-- 开场说明 -->
      <div v-if="phase === 'intro'" class="overlay">
        <p class="eyebrow">07 · 终章</p>
        <h2>记忆跃迁</h2>
        <p class="desc">
          七块碎片散落在纸境里。操控小纸偶，<br />
          把它们一块一块捡回来，拼合皇冠。
        </p>
        <div class="keys" aria-hidden="true">
          <span class="key">← ↑ ↓ →</span>
          <span class="key">W A S D</span>
          <span class="key">触屏方向键</span>
        </div>
        <button type="button" class="btn-primary" @click="start">
          {{ played ? '再玩一次' : '开始跃迁' }}
        </button>
        <button v-if="played" type="button" class="link" @click="router.push('/ending')">
          直接查看结局 →
        </button>
        <p class="tip">收集过程中不会失败，慢慢走也没关系。</p>
      </div>

      <!-- 通关：皇冠拼合 -->
      <div v-else-if="phase === 'merging'" class="overlay merge" role="status">
        <svg class="crown m-pop-center" viewBox="0 0 100 70" aria-hidden="true">
          <path
            d="M8 58 L14 16 L33 36 L50 8 L67 36 L86 16 L92 58 Q50 66 8 58 Z"
            fill="var(--yellow)"
            stroke="var(--ink)"
            stroke-width="4"
            stroke-linejoin="round"
          />
          <circle cx="24" cy="48" r="4" fill="var(--orange)" />
          <circle cx="50" cy="46" r="4" fill="var(--green)" />
          <circle cx="76" cy="48" r="4" fill="var(--sky)" />
        </svg>
        <h2>皇冠正在拼合…</h2>
        <p class="desc">七块记忆都回来了，纸境的光正在聚拢。</p>
      </div>
    </div>

    <!-- 移动端虚拟方向键 -->
    <div class="dpad" aria-label="虚拟方向键">
      <button type="button" class="up" aria-label="向上" @pointerdown.prevent="hold($event, 'up')" @pointerup="press('up', false)" @pointercancel="press('up', false)" @lostpointercapture="press('up', false)">▲</button>
      <button type="button" class="left" aria-label="向左" @pointerdown.prevent="hold($event, 'left')" @pointerup="press('left', false)" @pointercancel="press('left', false)" @lostpointercapture="press('left', false)">◀</button>
      <button type="button" class="right" aria-label="向右" @pointerdown.prevent="hold($event, 'right')" @pointerup="press('right', false)" @pointercancel="press('right', false)" @lostpointercapture="press('right', false)">▶</button>
      <button type="button" class="down" aria-label="向下" @pointerdown.prevent="hold($event, 'down')" @pointerup="press('down', false)" @pointercancel="press('down', false)" @lostpointercapture="press('down', false)">▼</button>
    </div>

    <p class="foot-note">每收集一块，房间里的灯就会多亮一盏。</p>
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
  border-bottom: 2px dashed var(--rule);
  padding-bottom: 0.8rem;
  margin-bottom: 1rem;
}
.head h1 {
  font-family: var(--f-title);
  font-size: 1.3rem;
  margin: 0;
  text-align: right;
}
.back {
  padding: 0.4rem 1rem;
  background: var(--bg2);
  border: 2.5px solid var(--deep);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--deep);
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop);
  white-space: nowrap;
}
.back:hover { transform: translateY(-3px); }

.hud {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}
.count {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
  font-family: var(--f-num);
  white-space: nowrap;
}
.count b {
  color: var(--ink);
  font-size: 1rem;
}

.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  max-height: 62dvh;
  border: 3px solid var(--rule);
  border-radius: var(--r-panel);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  background: var(--bg);
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
  gap: 0.55rem;
  padding: 1.2rem 1.4rem;
  text-align: center;
  background: var(--bg);
  border-radius: inherit;
}
.eyebrow {
  margin: 0;
  font-family: var(--f-num);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  color: var(--orange);
}
.overlay h2 {
  font-family: var(--f-title);
  font-size: 1.5rem;
  margin: 0;
}
.desc {
  margin: 0;
  color: var(--muted);
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
  border: 1.5px dashed var(--rule);
  border-radius: 8px;
  font-family: var(--f-num);
  font-size: 0.74rem;
  color: var(--deep);
}
.link {
  background: none;
  border: none;
  border-bottom: 1.5px dashed var(--locked-line);
  padding: 0.1rem 0.2rem;
  color: var(--muted);
  font-size: 0.78rem;
  cursor: pointer;
}
.link:hover {
  color: var(--ink);
  border-color: var(--orange);
}
.tip {
  margin: 0.3rem 0 0;
  font-size: 0.72rem;
  color: var(--muted);
}

.merge .crown {
  width: 110px;
}
.merge h2 {
  font-size: 1.25rem;
}

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
  background: var(--bg2);
  border: 2.5px solid var(--deep);
  border-radius: 12px 4px 12px 4px;
  box-shadow: var(--shadow-pop);
  font-size: 1rem;
  color: var(--deep);
  cursor: pointer;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  transition: transform 0.1s, box-shadow 0.1s;
}
.dpad button:active {
  transform: translateY(2px);
  box-shadow: 1px 1px 0 var(--rule);
}
.dpad .up { grid-area: 1 / 2; }
.dpad .left { grid-area: 2 / 1; }
.dpad .right { grid-area: 2 / 3; }
.dpad .down { grid-area: 3 / 2; }

.foot-note {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
}

@media (hover: none), (max-width: 760px) {
  .dpad { display: grid; }
  .stage { aspect-ratio: 4 / 3; max-height: 46dvh; }
  .overlay { padding: 0.9rem 1rem; gap: 0.4rem; }
  .overlay h2 { font-size: 1.25rem; }
  .desc { font-size: 0.8rem; }
  .dpad { margin-top: 0.7rem; }
}
</style>
