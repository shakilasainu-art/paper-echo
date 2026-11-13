<script setup lang="ts">
/**
 * 06 场景漫游
 * 六张圆角场景卡组成 3D 环形卡组，纵向滚轮 / 触摸滑动驱动旋转。
 * 点击卡片后居中展开完整场景；首末幕放行页面滚动，保证页脚可达。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, type ComponentPublicInstance, type CSSProperties } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import { SCENES_DATA, type Scene } from '../../config/content'

const COOLDOWN = 560
const DELTA_MIN = 12
const SWIPE_MIN = 40
const COUNT = SCENES_DATA.length

const index = ref(0)
const selected = ref<Scene | null>(null)
const backdropOn = ref(false)
const active = computed(() => SCENES_DATA[index.value])
const selectedIndex = computed(() => selected.value ? SCENES_DATA.findIndex((s) => s.id === selected.value?.id) : -1)
const stage = useTemplateRef<HTMLElement>('stage')
const dialogEl = useTemplateRef<HTMLElement>('dialogEl')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const cardEls = ref<HTMLElement[]>([])

let lastWheel = 0
let touchStart: { x: number; y: number } | null = null
let returnFocus: HTMLElement | null = null
let previousOverflow = ''
let closing = false
let closeTimer: number | undefined

function canMove(d: number) {
  const next = index.value + d
  return next >= 0 && next < COUNT
}

function step(d: number) {
  if (!canMove(d)) return false
  index.value += d
  return true
}

function goTo(i: number) {
  if (i < 0 || i >= COUNT) return
  index.value = i
}

/* 将卡片序号折算到当前卡片周围，形成首尾相接的视觉圆环。 */
function offsetFor(i: number) {
  let offset = i - index.value
  if (offset > COUNT / 2) offset -= COUNT
  if (offset < -COUNT / 2) offset += COUNT
  return offset
}

function cardStyle(i: number): CSSProperties {
  const offset = offsetFor(i)
  const distance = Math.abs(offset)
  return {
    /* 卡位变换与入场关键帧保持同一组函数，才能连续补间 */
    transform: `translate(-50%, -50%) translateX(calc(var(--card-step) * ${offset})) translateY(${distance * distance * 3}px) translateZ(${-distance * 130}px) rotateY(${offset * -34}deg) rotate(${offset * 1.3}deg)`,
    opacity: distance > 2 ? 0 : 1 - distance * 0.18,
    zIndex: 20 - distance,
    pointerEvents: distance > 2 ? 'none' : 'auto',
    animationDelay: `${i * 60}ms`,
  }
}

function setCardRef(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLElement) cardEls.value[i] = el
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* 弹窗从卡片卡位出发所需的位移、缩放与倾角，形成「抽卡」轨迹 */
function flipStyle(card: HTMLElement): CSSProperties | null {
  const dialog = dialogEl.value
  if (!dialog) return null
  const from = card.getBoundingClientRect()
  const to = dialog.getBoundingClientRect()
  if (!to.width || !to.height) return null
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  const tilt = offsetFor(cardEls.value.indexOf(card)) * 1.3
  // 等比缩放：宽度对齐卡位，避免弹出卡被横向压扁、圆角变椭圆
  const scale = from.width / to.width
  return {
    transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(${scale})`,
  }
}

async function openScene(scene: Scene, ev: MouseEvent) {
  if (selected.value || closing) return
  const card = ev.currentTarget instanceof HTMLElement ? ev.currentTarget : null
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  selected.value = scene
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  const dialog = dialogEl.value
  const start = card && dialog ? flipStyle(card) : null
  if (dialog && start) {
    if (!reduceMotion()) {
      dialog.animate(
        [{ transform: start.transform }, { transform: 'none' }],
        { duration: 620, easing: 'cubic-bezier(0.3, 1.16, 0.56, 1)' },
      )
    }
    requestAnimationFrame(() => { backdropOn.value = true })
  } else {
    backdropOn.value = true
  }
  closeButton.value?.focus({ preventScroll: true })
}

function closeScene() {
  if (!selected.value || closing) return
  const target = cardEls.value[selectedIndex.value]
  const dialog = dialogEl.value
  closing = true
  backdropOn.value = false
  const back = target && dialog ? flipStyle(target) : null
  if (dialog && back && !reduceMotion()) {
    const anim = dialog.animate(
      [{ transform: 'none' }, { transform: back.transform }],
      { duration: 520, easing: 'cubic-bezier(0.45, 0.05, 0.55, 1)', fill: 'forwards' },
    )
    anim.onfinish = () => finishClose()
    // 兜底：动画事件缺失时也能收起
    closeTimer = window.setTimeout(() => finishClose(), 700)
  } else {
    finishClose()
  }
}

function finishClose() {
  if (closeTimer) window.clearTimeout(closeTimer)
  closeTimer = undefined
  closing = false
  selected.value = null
  backdropOn.value = false
  document.body.style.overflow = previousOverflow
  nextTick(() => returnFocus?.focus({ preventScroll: true }))
}

function onWheel(e: WheelEvent) {
  if (selected.value || Math.abs(e.deltaY) < DELTA_MIN) return
  const d = e.deltaY > 0 ? 1 : -1
  // 抵达首 / 末幕时放行页面滚动，保证能读到页脚并点亮碎片
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

function onTouchMove(e: TouchEvent) {
  if (!touchStart || selected.value) return
  const t = e.changedTouches[0]
  const dx = t.clientX - touchStart.x
  const dy = t.clientY - touchStart.y
  if (Math.abs(dy) < 10 || Math.abs(dy) < Math.abs(dx)) return
  if (canMove(dy < 0 ? 1 : -1)) e.preventDefault()
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
  if (selected.value) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeScene()
    } else if (e.key === 'Tab') {
      // 弹窗仅保留关闭按钮一个操作项，让焦点留在弹窗内。
      e.preventDefault()
      closeButton.value?.focus()
    }
    return
  }
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
  el?.addEventListener('touchmove', onTouchMove, { passive: false })
  el?.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  const el = stage.value
  el?.removeEventListener('wheel', onWheel)
  el?.removeEventListener('touchstart', onTouchStart)
  el?.removeEventListener('touchmove', onTouchMove)
  el?.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('keydown', onKey)
  if (closeTimer) window.clearTimeout(closeTimer)
  if (selected.value) document.body.style.overflow = previousOverflow
})
</script>

<template>
  <ChapterShell id="06" :threshold="0.5">
    <div class="scenes">
      <header class="lede m-rise">
        <p class="kicker">WANDERING · 场景漫游</p>
        <p class="txt">
          六段秋日记忆会像一手牌慢慢展开。上下滑动让它转起来，点中哪张，那张卡就会被单独抽出来，带你走进那一刻的风景。
        </p>
      </header>

      <section
        ref="stage"
        class="viewport"
        tabindex="0"
        role="region"
        aria-roledescription="旋转场景卡组"
        :aria-label="`场景 ${index + 1} / ${COUNT}：${active.title}`"
      >
        <span class="stage-glow" aria-hidden="true"></span>
        <div class="carousel" :class="{ receded: backdropOn }">
          <button
            v-for="(scene, i) in SCENES_DATA"
            :key="scene.id"
            :ref="(el) => setCardRef(el, i)"
            type="button"
            class="scene-card"
            :class="{ current: i === index, concealed: Math.abs(offsetFor(i)) > 2 }"
            :style="cardStyle(i)"
            :tabindex="Math.abs(offsetFor(i)) > 2 ? -1 : 0"
            :aria-hidden="Math.abs(offsetFor(i)) > 2"
            :aria-label="`打开场景 ${i + 1}：${scene.title}`"
            @click="openScene(scene, $event)"
          >
            <img :src="scene.img" :alt="scene.alt" loading="eager" draggable="false" />
            <span class="card-no" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          </button>
        </div>

        <Transition name="caption" mode="out-in">
          <div :key="active.id" class="active-copy" aria-live="polite">
            <p class="scene-count">SCENE {{ String(index + 1).padStart(2, '0') }} / {{ String(COUNT).padStart(2, '0') }}</p>
            <h2>{{ active.title }}</h2>
            <p class="active-caption">{{ active.caption }}</p>
          </div>
        </Transition>

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
          :disabled="index === COUNT - 1"
          @click="step(1)"
        >
          →
        </button>

        <div class="dots" aria-label="场景指示">
          <button
            v-for="(scene, i) in SCENES_DATA"
            :key="scene.id"
            type="button"
            class="dot"
            :aria-label="`转到${scene.title}`"
            :aria-current="i === index ? 'true' : undefined"
            :class="{ on: i === index }"
            @click="goTo(i)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 13h-1v4a2 2 0 0 1-2 2h-4v-1a2 2 0 1 0-4 0v1H4a2 2 0 0 1-2-2v-4h1a2 2 0 1 0 0-4H2V5a2 2 0 0 1 2-2h4v1a2 2 0 1 0 4 0V3h4a2 2 0 0 1 2 2v4h1a2 2 0 1 1 0 4z" />
            </svg>
          </button>
        </div>
      </section>

      <p class="tip">
        {{ index === COUNT - 1
          ? '已到最后一幕 · 继续向下滚动，就能点亮这一页'
          : '鼠标上下滚动 / ↑↓ / 触摸滑动 · 点击一张卡把它抽出来' }}
      </p>
    </div>
    <Teleport to="body">
      <div v-if="selected" class="scene-modal" :class="{ on: backdropOn }" @click.self="closeScene">
        <article
          ref="dialogEl"
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scene-dialog-title"
          aria-describedby="scene-dialog-caption"
        >
          <button ref="closeButton" type="button" class="close" aria-label="关闭场景" @click="closeScene">
            ×
          </button>
          <figure>
            <img :src="selected.img" :alt="selected.alt" />
            <figcaption>
              <div class="dialog-heading">
                <p class="dialog-no">SCENE {{ String(selectedIndex + 1).padStart(2, '0') }} / {{ String(COUNT).padStart(2, '0') }}</p>
                <h2 id="scene-dialog-title">{{ selected.title }}</h2>
              </div>
              <p id="scene-dialog-caption" class="dialog-caption">{{ selected.caption }}</p>
            </figcaption>
          </figure>
        </article>
      </div>
    </Teleport>
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

.viewport {
  --card-step: clamp(130px, 20vw, 250px);
  --card-width: clamp(230px, 34vw, 400px);
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  height: clamp(540px, 68dvh, 650px);
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 34%, var(--bg2) 0%, transparent 58%),
    linear-gradient(180deg, var(--party-pale), var(--bg));
  border-top: 3px solid var(--rule);
  border-bottom: 3px solid var(--rule);
  outline: none;
  isolation: isolate;
}
.viewport::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: radial-gradient(color-mix(in srgb, var(--sky) 52%, transparent) 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  opacity: 0.32;
  pointer-events: none;
}
.viewport:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: -7px;
}

/* 卡组背后的聚光，托出被抽出的那一张 */
.stage-glow {
  position: absolute;
  top: 2.4rem;
  left: 50%;
  width: min(760px, 88vw);
  height: 350px;
  transform: translateX(-50%);
  background: radial-gradient(
    ellipse at 50% 46%,
    color-mix(in srgb, var(--yellow) 26%, transparent) 0%,
    color-mix(in srgb, var(--sky) 16%, transparent) 46%,
    transparent 72%
  );
  filter: blur(6px);
  pointer-events: none;
}

.carousel {
  position: absolute;
  top: 1.4rem;
  left: 0;
  right: 0;
  height: 320px;
  perspective: 1200px;
  transform-style: preserve-3d;
  transition: transform 0.5s var(--ease-pop), opacity 0.4s ease, filter 0.4s ease;
}
/* 抽出一张卡时，其余卡片向后退开 */
.carousel.receded {
  transform: scale(0.94);
  opacity: 0.28;
  filter: blur(2px) saturate(0.75);
}
.scene-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--card-width);
  aspect-ratio: 16 / 9;
  padding: 0;
  overflow: hidden;
  background: var(--cream);
  border: 3px solid var(--cream);
  border-radius: clamp(20px, 2.2vw, 30px);
  box-shadow: 0 0 0 2px var(--ink), var(--shadow-lift);
  cursor: pointer;
  outline: none;
  transform-origin: center;
  transition: transform 0.68s var(--ease-pop), opacity 0.4s ease, filter 0.3s ease;
  will-change: transform;
  -webkit-tap-highlight-color: transparent;
  /* 入场：从中心牌堆里扇形弹出，逐张错开 */
  animation: card-in 0.9s var(--ease-pop) backwards;
}
@keyframes card-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(0px) translateY(0px) translateZ(-680px) rotateY(0deg) rotate(0deg);
  }
}
.scene-card:not(.current) {
  filter: saturate(0.78) brightness(0.9);
}
.scene-card.current {
  box-shadow: 0 0 0 2px var(--ink), 0 0 0 6px color-mix(in srgb, var(--yellow) 64%, transparent), var(--shadow-lift);
}
.scene-card:hover {
  filter: none;
}
.scene-card:focus-visible {
  outline: 4px dashed var(--orange);
  outline-offset: 7px;
}
.scene-card.concealed {
  visibility: hidden;
}
.scene-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
  pointer-events: none;
  transition: transform 0.5s var(--ease-pop);
}
.scene-card:hover img {
  transform: scale(1.035);
}
.card-no {
  position: absolute;
  left: 10px;
  bottom: 10px;
  min-width: 31px;
  padding: 0.1rem 0.38rem;
  background: color-mix(in srgb, var(--cream) 92%, transparent);
  border: 2px solid var(--ink);
  border-radius: 999px;
  color: var(--ink);
  font-family: var(--f-num);
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.08em;
}

.active-copy {
  position: absolute;
  left: 50%;
  bottom: 5rem;
  width: min(570px, 72%);
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none;
}
.scene-count {
  margin: 0 0 0.25rem;
  color: var(--orange);
  font-family: var(--f-num);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}
.active-copy h2 {
  margin: 0 0 0.45rem;
  font-family: var(--f-title);
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  letter-spacing: 0.06em;
}
.active-caption {
  margin: 0;
  color: var(--deep);
  font-size: 0.82rem;
  line-height: 1.8;
}
.caption-enter-active,
.caption-leave-active {
  transition: opacity 0.22s ease, transform 0.28s var(--ease-pop);
}
.caption-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
.caption-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

.nav {
  position: absolute;
  top: 156px;
  z-index: 40;
  width: 42px;
  height: 56px;
  margin-top: -28px;
  padding: 0;
  background: color-mix(in srgb, var(--cream) 90%, transparent);
  border: 2.5px solid var(--ink);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  color: var(--ink);
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop), opacity 0.2s;
}
.nav:hover:not(:disabled) {
  transform: translateY(-3px);
}
.nav:disabled {
  opacity: 0.3;
  border-style: dashed;
  cursor: not-allowed;
}
.nav.prev {
  left: clamp(0.55rem, 3vw, 2rem);
}
.nav.next {
  right: clamp(0.55rem, 3vw, 2rem);
}

.dots {
  position: absolute;
  left: 50%;
  bottom: 1.1rem;
  z-index: 40;
  display: flex;
  gap: 0.42rem;
  padding: 0.35rem 0.58rem;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--cream) 90%, transparent);
  border: 2px solid var(--ink);
  border-radius: 999px;
}
.dot {
  width: 25px;
  height: 25px;
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
.dot path {
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
.dot.on path {
  fill: var(--yellow);
  stroke: var(--ink);
}
.tip {
  margin: 1.1rem 0 0.4rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.76rem;
}

/* 点击卡片后的全屏场景预览：卡片从卡位被抽出、放大 */
.scene-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: clamp(0.75rem, 3vw, 2rem);
  background: color-mix(in srgb, var(--ink) 74%, transparent);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.32s ease;
}
.scene-modal.on {
  opacity: 1;
}
.dialog {
  position: relative;
  width: min(960px, 94vw);
  max-height: 92dvh;
  overflow: auto;
  background: var(--cream);
  border: 3px solid var(--ink);
  border-radius: 34px;
  box-shadow: 8px 8px 0 color-mix(in srgb, var(--ink) 35%, transparent);
  transform-origin: center;
  will-change: transform;
}
.dialog figure {
  margin: 0;
}
.dialog img {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(58dvh, 540px);
  object-fit: cover;
  background: var(--bg2);
  border-radius: 31px 31px 0 0;
}
.dialog figcaption {
  display: grid;
  grid-template-columns: minmax(230px, 0.9fr) 1.1fr;
  align-items: center;
  gap: 2rem;
  padding: 1.35rem 1.6rem 1.5rem;
}
.dialog-no {
  margin: 0 0 0.3rem;
  color: var(--orange);
  font-family: var(--f-num);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}
.dialog h2 {
  margin: 0;
  font-family: var(--f-title);
  font-size: clamp(1.15rem, 2.6vw, 1.65rem);
  line-height: 1.45;
  letter-spacing: 0.06em;
}
.dialog-caption {
  margin: 0;
  color: var(--deep);
  font-size: 0.9rem;
  line-height: 1.9;
}
.close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 43px;
  height: 43px;
  padding: 0 0 3px;
  background: var(--cream);
  border: 2.5px solid var(--ink);
  border-radius: 50%;
  box-shadow: var(--shadow-pop);
  color: var(--ink);
  font-family: var(--f-num);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop);
}
.close:hover {
  transform: rotate(8deg) scale(1.06);
}
.close:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 3px;
}
@media (max-width: 720px) {
  .viewport {
    --card-step: clamp(112px, 35vw, 150px);
    --card-width: clamp(220px, 64vw, 280px);
    height: 550px;
  }
  .carousel {
    top: 2.1rem;
    height: 255px;
    perspective: 900px;
  }
  .scene-card {
    border-radius: 22px;
  }
  .scene-card:not(.current) {
    opacity: 0.5;
  }
  .nav {
    top: 127px;
    width: 35px;
    height: 46px;
    margin-top: -23px;
  }
  .active-copy {
    bottom: 5.1rem;
    width: calc(100% - 2.2rem);
  }
  .active-caption {
    font-size: 0.77rem;
    line-height: 1.7;
  }
  .dots {
    bottom: 1rem;
    gap: 0.25rem;
  }
  .dot {
    width: 23px;
    height: 23px;
  }
  .tip {
    padding: 0 0.6rem;
    line-height: 1.65;
  }
  .dialog {
    width: calc(100vw - 24px);
    border-radius: 30px;
  }
  .dialog img {
    max-height: min(54dvh, 470px);
    border-radius: 27px 27px 0 0;
  }
  .dialog figcaption {
    display: block;
    padding: 1.05rem 1.1rem 1.25rem;
  }
  .dialog-heading {
    margin-bottom: 0.65rem;
  }
  .dialog-caption {
    font-size: 0.82rem;
  }
  .close {
    width: 38px;
    height: 38px;
    font-size: 1.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scene-card {
    animation: none;
  }
  .scene-card,
  .scene-card img,
  .caption-enter-active,
  .caption-leave-active,
  .dialog,
  .scene-modal {
    transition-duration: 1ms;
  }
}
</style>
