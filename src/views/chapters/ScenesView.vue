<script setup lang="ts">
/**
 * 06 场景漫游（技术方案 §05 / M3）
 * 整屏卡片：滚轮一次性步进 + 800ms 冷却（deltaY ≥ 12），3D 翻转推出
 * 触摸 swipe 40px、↑↓ / ← → 键、指示点与小拼图同形
 */
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import { SCENES_DATA } from '../../config/content'

const COOLDOWN = 800
const DELTA_MIN = 12
const SWIPE_MIN = 40

const index = ref(0)
const dir = ref(1)
const active = computed(() => SCENES_DATA[index.value])
const stage = useTemplateRef<HTMLElement>('stage')

let lastWheel = 0
let touchStart: { x: number; y: number } | null = null

function canMove(d: number) {
  const next = index.value + d
  return next >= 0 && next < SCENES_DATA.length
}

function step(d: number) {
  if (!canMove(d)) return false
  dir.value = d
  index.value += d
  return true
}

function goTo(i: number) {
  if (i === index.value || i < 0 || i >= SCENES_DATA.length) return
  dir.value = i > index.value ? 1 : -1
  index.value = i
}

function onWheel(e: WheelEvent) {
  if (Math.abs(e.deltaY) < DELTA_MIN) return
  const d = e.deltaY > 0 ? 1 : -1
  // 抵达首/末幕时放行页面滚动，保证能读到页脚并点亮碎片
  if (!canMove(d)) return
  e.preventDefault()
  const now = Date.now()
  if (now - lastWheel < COOLDOWN) return
  lastWheel = now
  step(d)
}

function onTouchStart(e: TouchEvent) {
  const t = e.changedTouches[0]
  touchStart = { x: t.clientX, y: t.clientY }
}

function onTouchEnd(e: TouchEvent) {
  if (!touchStart) return
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStart.x
  const dy = t.clientY - touchStart.y
  touchStart = null
  if (Math.abs(dy) < SWIPE_MIN || Math.abs(dy) < Math.abs(dx)) return
  step(dy < 0 ? 1 : -1)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    if (canMove(1)) {
      e.preventDefault()
      step(1)
    }
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    if (canMove(-1)) {
      e.preventDefault()
      step(-1)
    }
  }
}

onMounted(() => {
  const el = stage.value
  el?.addEventListener('wheel', onWheel, { passive: false })
  el?.addEventListener('touchstart', onTouchStart, { passive: true })
  el?.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  const el = stage.value
  el?.removeEventListener('wheel', onWheel)
  el?.removeEventListener('touchstart', onTouchStart)
  el?.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <ChapterShell id="06" :threshold="0.5">
    <div class="scenes">
      <header class="lede m-rise">
        <p class="kicker">WANDERING · 场景漫游</p>
        <p class="txt">
          这是纸境里唯一的「全屏板块」。滚轮一次只翻一幕，免得你错过路上的一朵小花。走到最后一幕，再往下读，就能点亮这一页。
        </p>
      </header>

      <section
        ref="stage"
        class="viewport"
        tabindex="0"
        role="region"
        aria-roledescription="场景漫游"
        :aria-label="`场景 ${index + 1} / ${SCENES_DATA.length}：${active.title}`"
      >
        <Transition :name="dir > 0 ? 'flip-next' : 'flip-prev'">
          <figure :key="active.id" class="scene">
            <img :src="active.img" :alt="active.alt" loading="eager" />
            <figcaption class="plaque">
              <p class="no">{{ String(index + 1).padStart(2, '0') }} / 04</p>
              <h2>{{ active.title }}</h2>
              <p class="cap">{{ active.caption }}</p>
            </figcaption>
          </figure>
        </Transition>

        <span class="tape left" aria-hidden="true"></span>
        <span class="tape right" aria-hidden="true"></span>

        <!-- 左右切换 -->
        <button
          type="button"
          class="nav prev"
          aria-label="上一场景"
          :disabled="index === 0"
          @click="step(-1)"
        >
          ←
        </button>
        <button
          type="button"
          class="nav next"
          aria-label="下一场景"
          :disabled="index === SCENES_DATA.length - 1"
          @click="step(1)"
        >
          →
        </button>

        <!-- 小拼图指示点 -->
        <div class="dots" role="tablist" aria-label="场景指示">
          <button
            v-for="(s, i) in SCENES_DATA"
            :key="s.id"
            type="button"
            class="dot"
            role="tab"
            :aria-selected="i === index"
            :aria-label="s.title"
            :class="{ on: i === index }"
            @click="goTo(i)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 13h-1v4a2 2 0 0 1-2 2h-4v-1a2 2 0 1 0-4 0v1H4a2 2 0 0 1-2-2v-4h1a2 2 0 1 0 0-4H2V5a2 2 0 0 1 2-2h4v1a2 2 0 1 0 4 0V3h4a2 2 0 0 1 2 2v4h1a2 2 0 1 1 0 4z" />
            </svg>
          </button>
        </div>

        <p class="scroll-hint" aria-hidden="true">
          {{ index === SCENES_DATA.length - 1 ? '已到最后一幕 · 继续向下阅读' : '滚轮向下 · 进入下一幕' }}
          <span class="chev">↓</span>
        </p>
      </section>

      <p class="tip">滚轮 / ↑↓ / ← → / 左右滑动切换 · 一次只走一幕</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.lede {
  padding: 0 0 1.2rem;
}
.kicker {
  margin: 0 0 0.3rem;
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  color: var(--orange);
  font-weight: 700;
}
.txt {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.95;
  color: var(--ink);
  max-width: 36em;
}

/* 全幅舞台 */
.viewport {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  height: clamp(430px, 64dvh, 620px);
  overflow: hidden;
  background: var(--bg2);
  border-top: 3px solid var(--rule);
  border-bottom: 3px solid var(--rule);
  outline: none;
}
.viewport:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: -6px;
}

.scene {
  position: absolute;
  inset: 0;
  margin: 0;
  background: var(--cream);
}
.scene img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 42%;
}

/* 手帐胶带 */
.tape {
  position: absolute;
  top: -8px;
  width: 92px;
  height: 22px;
  background: color-mix(in srgb, var(--yellow) 62%, transparent);
  border-left: 2px dashed var(--cream);
  border-right: 2px dashed var(--cream);
  opacity: 0.9;
  pointer-events: none;
}
.tape.left {
  left: 9%;
  transform: rotate(-4deg);
}
.tape.right {
  right: 9%;
  transform: rotate(3deg);
}

/* 场景说明牌 */
.plaque {
  position: absolute;
  left: clamp(0.8rem, 4vw, 2.4rem);
  bottom: clamp(1rem, 5vh, 2.4rem);
  width: min(420px, 62%);
  padding: 0.85rem 1.1rem 0.95rem;
  background: color-mix(in srgb, var(--cream) 94%, transparent);
  border: 2.5px solid var(--ink);
  border-radius: 3px 18px 3px 18px;
  box-shadow: var(--shadow-pop);
}
.plaque .no {
  margin: 0 0 0.2rem;
  font-family: var(--f-num);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  color: var(--orange);
  font-weight: 700;
}
.plaque h2 {
  margin: 0 0 0.35rem;
  font-family: var(--f-title);
  font-size: clamp(1.05rem, 2.2vw, 1.4rem);
  letter-spacing: 0.08em;
}
.plaque .cap {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.8;
  color: var(--deep);
}

/* 左右导航 */
.nav {
  position: absolute;
  top: 50%;
  width: 42px;
  height: 58px;
  margin-top: -29px;
  padding: 0;
  background: color-mix(in srgb, var(--cream) 88%, transparent);
  border: 2.5px solid var(--ink);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  color: var(--ink);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.85;
  transition: transform 0.25s var(--ease-pop), opacity 0.2s;
}
.nav:hover:not(:disabled) {
  transform: translateY(-3px);
  opacity: 1;
}
.nav:disabled {
  opacity: 0.3;
  border-style: dashed;
  cursor: not-allowed;
}
.nav.prev {
  left: 0.8rem;
}
.nav.next {
  right: 0.8rem;
}

/* 拼图指示点 */
.dots {
  position: absolute;
  right: clamp(0.8rem, 4vw, 2.4rem);
  bottom: clamp(1rem, 5vh, 2.4rem);
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: color-mix(in srgb, var(--cream) 88%, transparent);
  border: 2px solid var(--ink);
  border-radius: 999px;
}
.dot {
  width: 26px;
  height: 26px;
  padding: 0;
  background: none;
  border: none;
  color: var(--locked-line);
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop), color 0.2s;
}
.dot svg {
  display: block;
  width: 100%;
  height: 100%;
}
.dot svg path {
  fill: var(--bg2);
  stroke: currentColor;
  stroke-width: 1.6;
}
.dot:hover {
  transform: translateY(-2px);
}
.dot.on {
  color: var(--orange);
}
.dot.on svg path {
  fill: var(--yellow);
  stroke: var(--ink);
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  left: 50%;
  bottom: 0.7rem;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.2rem 0.75rem;
  background: color-mix(in srgb, var(--bg) 80%, transparent);
  border-radius: 999px;
  font-size: 0.7rem;
  color: var(--deep);
  white-space: nowrap;
  pointer-events: none;
}
.chev {
  display: inline-block;
  margin-left: 0.25rem;
  animation: chev 1.6s ease-in-out infinite;
}
@keyframes chev {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

/* 3D 翻转转场 */
.flip-next-enter-active,
.flip-next-leave-active,
.flip-prev-enter-active,
.flip-prev-leave-active {
  transition: transform 0.6s var(--ease-pop), opacity 0.5s ease;
}
.flip-next-enter-from {
  transform: perspective(1200px) rotateX(18deg) translateY(10%);
  opacity: 0;
}
.flip-next-leave-to {
  transform: perspective(1200px) rotateX(-18deg) translateY(-8%);
  opacity: 0;
}
.flip-prev-enter-from {
  transform: perspective(1200px) rotateX(-18deg) translateY(-10%);
  opacity: 0;
}
.flip-prev-leave-to {
  transform: perspective(1200px) rotateX(18deg) translateY(8%);
  opacity: 0;
}

.tip {
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
  margin: 1.1rem 0 0.4rem;
}

@media (max-width: 720px) {
  .viewport {
    height: clamp(420px, 58dvh, 520px);
  }
  .plaque {
    width: auto;
    left: 0.6rem;
    right: 0.6rem;
    bottom: 3.2rem;
    padding: 0.6rem 0.8rem 0.7rem;
  }
  .plaque .cap {
    font-size: 0.74rem;
    line-height: 1.65;
  }
  .nav {
    width: 36px;
    height: 48px;
    margin-top: -24px;
  }
  .nav.prev {
    left: 0.4rem;
  }
  .nav.next {
    right: 0.4rem;
  }
  .dots {
    right: 50%;
    bottom: 0.55rem;
    transform: translateX(50%);
  }
  .scroll-hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .flip-next-enter-active,
  .flip-next-leave-active,
  .flip-prev-enter-active,
  .flip-prev-leave-active {
    transition-duration: 1ms;
  }
  .flip-next-enter-from,
  .flip-next-leave-to,
  .flip-prev-enter-from,
  .flip-prev-leave-to {
    transform: none;
  }
  .chev {
    animation: none;
  }
}
</style>
