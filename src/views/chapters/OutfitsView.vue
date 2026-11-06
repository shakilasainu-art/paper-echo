<script setup lang="ts">
/**
 * 03 衣服换装（技术方案 §05 / M3）
 * hover / focus-within 滑出服饰卡；左右按钮 + ← → 键切换；触屏点按立绘固定卡片
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import OutfitArt from '../../components/OutfitArt.vue'
import { OUTFITS_DATA } from '../../config/content'

const YUANYUAN = new URL('../../assets/img/pe_char_yuanyuan_2x.webp', import.meta.url).href

const index = ref(0)
const active = computed(() => OUTFITS_DATA[index.value])

const hovering = ref(false)
const pinned = ref(false)
const cardOpen = computed(() => hovering.value || pinned.value)

const oc1 = computed(() => `var(--${active.value.main})`)
const oc2 = computed(() => `var(--${active.value.accent})`)

function step(dir: number) {
  const len = OUTFITS_DATA.length
  index.value = (index.value + dir + len) % len
}

function onKey(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement | null)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    step(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    step(1)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <ChapterShell id="03" :threshold="0.55">
    <div class="outfits">
      <header class="lede m-rise">
        <p class="kicker">THE CLOSET · 衣橱</p>
        <p class="txt">
          衣橱是元元自己整理的。每一套衣服都对应一段路：日常、雨天、夜晚、远行，还有那个只留给特别日子的约定。把鼠标移到衣橱上，服饰卡会从右边滑出来。
        </p>
      </header>

      <div
        class="stage"
        :class="{ open: cardOpen }"
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
        @focusin="hovering = true"
        @focusout="hovering = false"
      >
        <button type="button" class="arrow left" aria-label="上一套衣服" @click="step(-1)">←</button>

        <div class="closet">
          <!-- 挂衣杆 -->
          <div class="rail" aria-hidden="true"></div>

          <!-- 立绘 -->
          <Transition name="model" mode="out-in">
            <div :key="active.id" class="model">
              <button
                type="button"
                class="portrait"
                :aria-label="`${active.name}，点按${pinned ? '收起' : '固定'}服饰卡`"
                @click="pinned = !pinned"
              >
                <span class="hanger" aria-hidden="true">
                  <svg viewBox="0 0 80 26">
                    <path d="M40 2 v6 M40 8 L16 20 Q40 27 64 20 L40 8 Z" />
                  </svg>
                </span>
                <img :src="YUANYUAN" alt="元元站在衣橱中央" loading="eager" />
                <span class="hallmark" aria-hidden="true">03 · 换装</span>
              </button>

              <div class="nameplate">
                <p class="seq">{{ String(index + 1).padStart(2, '0') }} / 05</p>
                <h2>{{ active.name }}</h2>
                <p class="sub">{{ active.subtitle }}</p>
              </div>
            </div>
          </Transition>

          <!-- 滑出服饰卡 -->
          <aside class="info" :class="{ open: cardOpen }" :aria-label="`${active.name}的服饰卡`">
            <div class="art" :style="{ '--oc1': oc1, '--oc2': oc2 }">
              <OutfitArt :kind="active.kind" />
            </div>
            <div class="info-body">
              <p class="info-kicker">{{ active.subtitle }}</p>
              <h3>{{ active.name }}</h3>
              <div class="tags">
                <span v-for="t in active.tags" :key="t">{{ t }}</span>
              </div>
              <p class="desc">{{ active.desc }}</p>
              <p class="note">{{ active.note }}</p>
            </div>
          </aside>
        </div>

        <button type="button" class="arrow right" aria-label="下一套衣服" @click="step(1)">→</button>
      </div>

      <!-- 衣架切换 -->
      <div class="rack" role="tablist" aria-label="选择服饰">
        <button
          v-for="(o, i) in OUTFITS_DATA"
          :key="o.id"
          type="button"
          class="chip"
          role="tab"
          :aria-selected="i === index"
          :class="{ on: i === index }"
          @click="index = i"
        >
          <svg class="mini-hanger" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 v3 M12 6 L4 12 Q12 16 20 12 L12 6 Z" />
          </svg>
          <span class="nm">{{ o.name }}</span>
        </button>
      </div>

      <p class="tip">← → 或点击衣架切换 · 触屏点一下立绘，服饰卡会固定</p>
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

/* 舞台 */
.stage {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 42px;
  gap: 0.8rem;
  align-items: center;
}
.arrow {
  width: 42px;
  height: 64px;
  padding: 0;
  background: var(--bg2);
  border: 2.5px solid var(--deep);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  color: var(--deep);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop);
}
.arrow:hover {
  transform: translateY(-3px);
}
.arrow:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 3px;
}

.closet {
  position: relative;
  overflow: hidden;
  min-height: clamp(430px, 56vh, 540px);
  border: 3px solid var(--rule);
  border-radius: 22px 6px 22px 6px;
  background:
    radial-gradient(circle at 50% 16%, var(--cream) 0 34%, transparent 68%),
    repeating-linear-gradient(90deg, transparent 0 38px, var(--rule) 38px 39px),
    var(--bg2);
  box-shadow: var(--shadow-pop);
}
/* 衣杆 */
.rail {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 2.6rem;
  border-top: 3px solid var(--deep);
  border-radius: 999px;
  opacity: 0.55;
}
.rail::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  width: 62%;
  height: 5px;
  transform: translateX(-50%);
  border-bottom: 2px dashed var(--rule);
}

/* 立绘 */
.model {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.4rem 1.2rem 2.2rem;
  transition: transform 0.55s var(--ease-pop);
}
.portrait {
  position: relative;
  display: block;
  width: clamp(190px, 34%, 268px);
  padding: 0.6rem 0.6rem 0.45rem;
  background: var(--cream);
  border: 3px solid var(--bg2);
  outline: 2px solid var(--rule);
  border-radius: 20px 6px 20px 6px;
  box-shadow: var(--shadow-pop);
  transform: rotate(-1.4deg);
  cursor: pointer;
  transition: transform 0.35s var(--ease-pop);
}
.portrait:hover {
  transform: rotate(0deg) translateY(-4px);
}
.portrait:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 4px;
}
.portrait img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 14px 4px 14px 4px;
}
.hanger {
  position: absolute;
  left: 50%;
  top: -20px;
  width: 54px;
  transform: translateX(-50%);
}
.hanger svg {
  display: block;
  width: 100%;
}
.hanger path {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hallmark {
  display: block;
  margin-top: 0.4rem;
  text-align: center;
  font-family: var(--f-title);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.nameplate {
  margin-top: 1rem;
  text-align: center;
}
.seq {
  margin: 0;
  font-family: var(--f-num);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: var(--muted);
}
.nameplate h2 {
  margin: 0.1rem 0 0;
  font-family: var(--f-title);
  font-size: 1.45rem;
  letter-spacing: 0.12em;
}
.sub {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  color: var(--deep);
}

/* 滑出服饰卡 */
.info {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  bottom: 0.7rem;
  width: min(300px, 48%);
  display: flex;
  flex-direction: column;
  background: var(--cream);
  border: 2.5px solid var(--ink);
  border-radius: 4px 24px 4px 24px;
  box-shadow: var(--shadow-lift);
  transform: translateX(calc(100% + 1.4rem));
  opacity: 0;
  pointer-events: none;
  transition: transform 0.55s var(--ease-pop), opacity 0.3s ease;
  overflow: hidden;
}
.info.open {
  transform: none;
  opacity: 1;
  pointer-events: auto;
}
.info::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 7px;
  background: repeating-linear-gradient(180deg, var(--yellow) 0 10px, var(--cream) 10px 20px);
  opacity: 0.7;
}
.art {
  height: 148px;
  flex: none;
  padding: 0.5rem 0.9rem 0 1.1rem;
  background: var(--bg2);
  border-bottom: 2px dashed var(--rule);
}
.info-body {
  padding: 0.85rem 1.1rem 1.1rem 1.35rem;
  overflow-y: auto;
}
.info-kicker {
  margin: 0 0 0.15rem;
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  color: var(--orange);
  font-weight: 700;
}
.info h3 {
  margin: 0 0 0.55rem;
  font-family: var(--f-title);
  font-size: 1.2rem;
  letter-spacing: 0.1em;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.7rem;
}
.tags span {
  padding: 0 0.55rem;
  background: var(--yellow);
  border: 1.5px solid var(--rule);
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}
.desc {
  margin: 0 0 0.7rem;
  font-size: 0.82rem;
  line-height: 1.85;
  color: var(--ink);
}
.note {
  margin: 0;
  padding-left: 0.7rem;
  border-left: 3px solid var(--green);
  font-size: 0.72rem;
  line-height: 1.7;
  color: var(--deep);
}

/* 衣架切换 */
.rack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
  gap: 0.65rem;
  margin-top: 1.5rem;
}
.chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.3rem 0.55rem;
  background: var(--bg2);
  border: 2px solid var(--rule);
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s var(--ease-pop), border-color 0.2s, box-shadow 0.2s;
}
.chip:hover,
.chip:focus-visible {
  transform: translateY(-4px);
  border-color: var(--orange);
  outline: none;
}
.chip.on {
  border-color: var(--ink);
  background: var(--cream);
  box-shadow: var(--shadow-pop);
}
.mini-hanger {
  width: 20px;
  height: 20px;
  color: var(--deep);
}
.mini-hanger path {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.chip .nm {
  font-size: 0.74rem;
  font-weight: 700;
}
.tip {
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
  margin: 1.1rem 0 0.4rem;
}

/* 立绘切换 */
.model-enter-active {
  transition: opacity 0.35s var(--ease-pop), transform 0.35s var(--ease-pop);
}
.model-leave-active {
  transition: opacity 0.18s;
}
.model-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.model-leave-to {
  opacity: 0;
}

/* 桌面滑出时立绘让位，避免遮住脸 */
@media (hover: hover) and (min-width: 761px) {
  .stage.open .model {
    transform: translateX(-12%);
  }
}

@media (hover: none), (max-width: 760px) {
  .stage {
    grid-template-columns: 1fr;
  }
  .arrow {
    position: absolute;
    z-index: 3;
    top: 40%;
    width: 38px;
    height: 54px;
  }
  .stage {
    position: relative;
  }
  .arrow.left {
    left: 0.35rem;
  }
  .arrow.right {
    right: 0.35rem;
  }
  .info {
    position: static;
    width: auto;
    margin: 0 0.7rem 0.7rem;
    transform: none;
    opacity: 1;
    pointer-events: auto;
  }
  .model {
    padding-bottom: 0.8rem;
  }
  .art {
    height: 128px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .info,
  .portrait,
  .model-enter-active,
  .model-leave-active {
    transition-duration: 1ms;
  }
}
</style>
