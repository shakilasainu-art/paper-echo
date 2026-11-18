<script setup lang="ts">
/**
 * 结局 · 纸境回响（技术方案 §05）
 * 7 块碎片沿弧线汇聚 → 皇冠拼合 → 结语逐行浮现
 * 「保存纪念卡」用 Canvas 合成 800×1000 PNG，navigator.share 可用时优先分享
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ENDING_COPY } from '../config/content'
import { SHARD_PATHS } from '../config/shards'
import { useProgress } from '../stores/progress'

const router = useRouter()
const progress = useProgress()

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const FRAG_PATHS = SHARD_PATHS

/** 碎片的起点（四散）与终点（围绕皇冠）——px */
const SHARD_START = [
  { x: -260, y: -180 },
  { x: 40, y: -240 },
  { x: 280, y: -160 },
  { x: 300, y: 80 },
  { x: 200, y: 220 },
  { x: -180, y: 230 },
  { x: -300, y: 120 },
]
const SHARD_END = [
  { x: -110, y: -40 },
  { x: -70, y: -104 },
  { x: 0, y: -124 },
  { x: 70, y: -104 },
  { x: 110, y: -40 },
  { x: 84, y: 38 },
  { x: -84, y: 38 },
]

function shardStyle(i: number) {
  return {
    '--sx': `${SHARD_START[i].x}px`,
    '--sy': `${SHARD_START[i].y}px`,
    '--fx': `${SHARD_END[i].x}px`,
    '--fy': `${SHARD_END[i].y}px`,
    animationDelay: reduced ? '0s' : `${i * 0.05}s`,
  }
}

function copyDelay(i: number) {
  return reduced ? '0s' : `${1.35 + i * 0.2}s`
}

// ---------- 统计 ----------
const completedAt = progress.data.completedAt ?? Date.now()
const startedAt = progress.data.startedAt ?? completedAt

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}
function formatDuration(ms: number) {
  const min = Math.round(ms / 60_000)
  if (min < 1) return '不到 1 分钟'
  if (min < 60) return `${min} 分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h < 24) return m ? `${h} 小时 ${m} 分钟` : `${h} 小时`
  const d = Math.floor(h / 24)
  const hh = h % 24
  return hh ? `${d} 天 ${hh} 小时` : `${d} 天`
}

const dateText = computed(() => formatDate(completedAt))
const durationText = computed(() => formatDuration(Math.max(0, completedAt - startedAt)))

// ---------- 纪念卡 ----------
function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function roundRectPath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function drawCard(): HTMLCanvasElement {
  const W = 800
  const H = 1000
  const card = document.createElement('canvas')
  card.width = W
  card.height = H
  const g = card.getContext('2d')!
  const col = {
    bg: cssVar('--bg'),
    bg2: cssVar('--bg2'),
    cream: cssVar('--cream'),
    ink: cssVar('--ink'),
    muted: cssVar('--muted'),
    rule: cssVar('--rule'),
    yellow: cssVar('--yellow'),
    orange: cssVar('--orange'),
    green: cssVar('--green'),
    pink: cssVar('--pink'),
    sky: cssVar('--sky'),
    deep: cssVar('--deep'),
  }

  // 纸底
  g.fillStyle = col.bg
  g.fillRect(0, 0, W, H)

  // 外框与内虚线
  g.strokeStyle = col.rule
  g.lineWidth = 8
  roundRectPath(g, 30, 30, W - 60, H - 60, 26)
  g.stroke()
  g.lineWidth = 2
  g.setLineDash([12, 10])
  roundRectPath(g, 52, 52, W - 104, H - 104, 18)
  g.stroke()
  g.setLineDash([])

  // 抬头
  g.textAlign = 'center'
  g.fillStyle = col.orange
  g.font = '700 22px "Outfit", "PingFang SC", sans-serif'
  g.fillText('SHATTERED CROWN · MEMORY CARD', W / 2, 118)

  // 光晕
  g.fillStyle = col.bg2
  g.beginPath()
  g.arc(W / 2, 300, 168, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = col.rule
  g.lineWidth = 3
  g.stroke()

  // 皇冠（与页面同一造型：三圆尖 + 橙色冠带）
  const crown = new Path2D(
    'M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z',
  )
  const band = new Path2D(
    'M22 50 H78 A8 8 0 0 1 86 58 V60 A8 8 0 0 1 78 68 H22 A8 8 0 0 1 14 60 V58 A8 8 0 0 1 22 50 Z',
  )
  g.save()
  g.translate(W / 2, 300)
  g.scale(3.1, 3.1)
  g.translate(-50, -39)
  g.fillStyle = col.yellow
  g.fill(crown)
  g.strokeStyle = col.ink
  g.lineWidth = 4.2
  g.lineJoin = 'round'
  g.stroke(crown)
  g.fillStyle = col.orange
  g.fill(band)
  g.stroke(band)
  g.restore()

  // 标题
  g.fillStyle = col.ink
  g.font = '700 50px "ZCOOL KuaiLe", "Microsoft YaHei", sans-serif'
  g.fillText('记忆完整 · 碎冠忆旅', W / 2, 528)

  g.fillStyle = col.muted
  g.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif'
  g.fillText('07 / 07 · 碎冠忆旅', W / 2, 570)

  // 分隔虚线
  g.strokeStyle = col.rule
  g.lineWidth = 2
  g.setLineDash([10, 8])
  g.beginPath()
  g.moveTo(170, 610)
  g.lineTo(630, 610)
  g.stroke()
  g.setLineDash([])

  // 数据行
  const rows: [string, string][] = [
    ['点亮日期', dateText.value],
    ['旅程用时', durationText.value],
    ['记忆碎片', '7 / 7'],
  ]
  let y = 665
  for (const [label, value] of rows) {
    g.textAlign = 'left'
    g.fillStyle = col.muted
    g.font = '500 23px "PingFang SC", "Microsoft YaHei", sans-serif'
    g.fillText(label, 200, y)
    g.textAlign = 'right'
    g.fillStyle = col.ink
    g.font = '700 23px "Outfit", "PingFang SC", sans-serif'
    g.fillText(value, 600, y)
    y += 46
  }

  // 七块小碎片
  const gap = 46
  const startX = W / 2 - (gap * 6) / 2
  for (let i = 0; i < 7; i++) {
    const fragPath = new Path2D(SHARD_PATHS[i])
    g.save()
    g.translate(startX + i * gap, 820)
    g.scale(0.26, 0.26)
    g.translate(-50, -50)
    g.fillStyle = col.yellow
    g.strokeStyle = col.orange
    g.lineWidth = 6
    g.lineJoin = 'round'
    g.fill(fragPath)
    g.stroke(fragPath)
    g.restore()
  }

  // 结语
  g.textAlign = 'center'
  g.fillStyle = col.muted
  g.font = '500 22px "LXGW WenKai", "KaiTi", "PingFang SC", sans-serif'
  g.fillText(`「${ENDING_COPY.shareQuote}」`, W / 2, 884)

  g.fillStyle = col.deep
  g.font = '600 20px "PingFang SC", "Microsoft YaHei", sans-serif'
  g.fillText(ENDING_COPY.sign, W / 2, 924)

  return card
}

// ---------- 分享 / 重开 ----------
const note = ref('')
let noteTimer = 0
function flash(msg: string) {
  note.value = msg
  window.clearTimeout(noteTimer)
  noteTimer = window.setTimeout(() => (note.value = ''), 2800)
}

type ShareNav = Navigator & {
  canShare?: (data?: ShareData) => boolean
  share?: (data?: ShareData) => Promise<void>
}

async function shareCard() {
  try {
    const card = drawCard()
    const blob = await new Promise<Blob | null>((resolve) => card.toBlob(resolve, 'image/png'))
    if (!blob) {
      flash('纪念卡生成失败，请稍后再试')
      return
    }
    const stamp = dateText.value.replace(/\./g, '')
    const file = new File([blob], `paper-echo-${stamp}.png`, { type: 'image/png' })
    const nav = navigator as ShareNav
    if (
      typeof nav.canShare === 'function' &&
      nav.canShare({ files: [file] }) &&
      typeof nav.share === 'function'
    ) {
      await nav.share({ files: [file], title: ENDING_COPY.shareTitle })
      flash('纪念卡已分享')
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    flash('纪念卡已保存到下载目录')
  } catch {
    flash('分享已取消，可以再次点击保存')
  }
}

function restart() {
  progress.reset()
  // 一并清掉开屏的「本会话已看过」标记，重新开始时从头播放
  sessionStorage.removeItem('pe-intro-seen')
  router.push('/')
}

onBeforeUnmount(() => window.clearTimeout(noteTimer))
</script>

<template>
  <div class="ending">
    <section class="assemble">
      <span class="halo" aria-hidden="true"></span>

      <svg class="crown" viewBox="0 0 100 78" role="img" aria-label="拼合完成的皇冠">
        <path
          d="M9 64 C6 53 5 43 9 34 C12 25 21 23 24 32 C26 39 28 43 32 45 Q35 47 38 44 C41 40 42 29 43 24 C44 13 46 7 51 7 C57 7 59 17 60 25 C61 34 62 42 65 44 Q68 46 71 42 C74 37 75 24 77 19 C79 12 87 12 89 21 C92 31 92 48 91 64 Z"
          fill="var(--yellow)"
          stroke="var(--ink)"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <rect
          x="14"
          y="50"
          width="72"
          height="18"
          rx="7.5"
          fill="var(--orange)"
          stroke="var(--ink)"
          stroke-width="4"
        />
      </svg>

      <span
        v-for="(_, i) in SHARD_START"
        :key="i"
        class="shard"
        :style="shardStyle(i)"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100">
          <path :d="FRAG_PATHS[i]" />
        </svg>
      </span>
    </section>

    <section class="copy">
      <p class="kicker m-rise" :style="{ animationDelay: copyDelay(0) }">
        {{ ENDING_COPY.kicker }}
      </p>
      <h1 class="m-rise" :style="{ animationDelay: copyDelay(1) }">
        {{ ENDING_COPY.title }}
      </h1>
      <p class="lead m-rise" :style="{ animationDelay: copyDelay(2) }">
        {{ ENDING_COPY.lead }}
      </p>

      <p
        v-for="(line, i) in ENDING_COPY.lines"
        :key="i"
        class="line m-rise"
        :style="{ animationDelay: copyDelay(3 + i) }"
      >
        {{ line }}
      </p>

      <p class="sign m-rise" :style="{ animationDelay: copyDelay(6) }">
        {{ ENDING_COPY.sign }}
      </p>

      <dl class="stats m-rise" :style="{ animationDelay: copyDelay(7) }">
        <div>
          <dt>点亮日期</dt>
          <dd>{{ dateText }}</dd>
        </div>
        <div>
          <dt>旅程用时</dt>
          <dd>{{ durationText }}</dd>
        </div>
        <div>
          <dt>记忆碎片</dt>
          <dd>7 / 7</dd>
        </div>
      </dl>

      <div class="actions m-rise" :style="{ animationDelay: copyDelay(8) }">
        <button type="button" class="btn-primary" @click="shareCard">保存纪念卡</button>
        <button type="button" class="ghost" @click="restart">重新开始</button>
      </div>

      <p v-if="note" class="note" role="status">{{ note }}</p>
      <p class="back-note">故事到这里并没有结束，只是换了个方式继续。</p>
      <button type="button" class="home-link" @click="router.push('/home')">
        回到房间看看 →
      </button>
    </section>
  </div>
</template>

<style scoped>
.ending {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.2rem 3rem;
  background: radial-gradient(circle at 50% 26%, var(--bg2), var(--bg) 58%);
}

/* ============ 皇冠拼合 ============ */
.assemble {
  position: relative;
  width: 100%;
  max-width: 560px;
  height: clamp(220px, 34vh, 300px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.crown {
  position: relative;
  z-index: 1;
  width: clamp(150px, 38%, 200px);
  opacity: 0;
  transform: scale(0.55);
  animation: crown-in 0.9s var(--ease-pop) 1.05s both;
}
.halo {
  position: absolute;
  width: clamp(220px, 52%, 300px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, var(--yellow) 0%, transparent 62%);
  opacity: 0;
  animation: halo 1.7s ease-out 1.3s both;
  pointer-events: none;
}
.shard {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  opacity: 0;
  animation: shard-merge 1.35s var(--ease-pop) both;
  pointer-events: none;
}
.shard svg {
  display: block;
  width: 100%;
  height: 100%;
}
.shard path {
  fill: var(--yellow);
  stroke: var(--orange);
  stroke-width: 6;
  stroke-linejoin: round;
}

@keyframes crown-in {
  0% { opacity: 0; transform: scale(0.55); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes halo {
  0% { opacity: 0; transform: scale(0.4); }
  42% { opacity: 0.55; }
  100% { opacity: 0; transform: scale(1.55); }
}
@keyframes shard-merge {
  0% {
    opacity: 0;
    transform: translate(var(--sx), var(--sy)) rotate(-24deg) scale(0.55);
  }
  18% { opacity: 1; }
  62% {
    opacity: 1;
    transform: translate(var(--fx), var(--fy)) rotate(6deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--fx), var(--fy)) rotate(0deg) scale(0.6);
  }
}

/* ============ 结语 ============ */
.copy {
  width: min(640px, 100%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
}
.kicker {
  margin: 0;
  font-family: var(--f-num);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: var(--orange);
}
.copy h1 {
  font-family: var(--f-title);
  font-size: clamp(1.7rem, 5vw, 2.3rem);
  margin: 0.1rem 0 0.3rem;
  color: var(--ink);
}
.lead {
  margin: 0 0 0.4rem;
  color: var(--deep);
  font-size: 0.92rem;
  font-weight: 700;
}
.line {
  margin: 0;
  color: var(--ink);
  font-size: 0.9rem;
  line-height: 1.95;
  max-width: 34em;
}
.sign {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: var(--muted);
}

.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin: 1.3rem 0 0.4rem;
  padding: 0;
}
.stats div {
  min-width: 128px;
  padding: 0.5rem 0.9rem;
  background: var(--bg2);
  border: 2px dashed var(--rule);
  border-radius: 12px;
}
.stats dt {
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.05em;
}
.stats dd {
  margin: 0.15rem 0 0;
  font-family: var(--f-num);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ink);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1.2rem;
}
.ghost {
  padding: 0.6rem 1.4rem;
  background: var(--bg2);
  border: 2.5px solid var(--deep);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--deep);
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop);
}
.ghost:hover { transform: translateY(-3px); }

.note {
  margin: 0.7rem 0 0;
  padding: 0.3rem 0.9rem;
  background: var(--bg2);
  border: 1.5px solid var(--orange);
  border-radius: 999px;
  font-size: 0.76rem;
  color: var(--ink);
}
.back-note {
  margin: 1rem 0 0;
  font-size: 0.76rem;
  color: var(--muted);
}
.home-link {
  margin-top: 0.35rem;
  padding: 0.2rem 0.4rem;
  background: none;
  border: none;
  border-bottom: 1.5px dashed var(--locked-line);
  font-size: 0.78rem;
  color: var(--muted);
  cursor: pointer;
}
.home-link:hover {
  color: var(--ink);
  border-color: var(--orange);
}

/* ============ 降级 ============ */
@media (prefers-reduced-motion: reduce) {
  .crown { opacity: 1; transform: none; animation: none; }
  .halo { display: none; }
  .shard { display: none; }
  .copy .m-rise { animation: none; }
}
</style>
