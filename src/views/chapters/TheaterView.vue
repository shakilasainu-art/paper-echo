<script setup lang="ts">
/**
 * 05 动作剧场（技术方案 §05 / M3）
 * 主舞台播放器：纸偶动画为片源，自制播放/暂停 + 倍速 + 进度
 * 下方胶片网格切换片段；离开路由时清掉计时器
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import { CHARACTERS_DATA, CLIPS_DATA } from '../../config/content'

const SPEEDS = [0.5, 1, 1.5]

const activeId = ref(CLIPS_DATA[0].id)
const active = computed(() => CLIPS_DATA.find((c) => c.id === activeId.value)!)
const activeIndex = computed(() => CLIPS_DATA.findIndex((c) => c.id === activeId.value))

const playing = ref(true)
const speed = ref(1)
const elapsed = ref(0)

const poster = computed(
  () => CHARACTERS_DATA.find((c) => c.id === active.value.characterId)?.avatar ?? '',
)
const progress = computed(() => Math.min(100, (elapsed.value / active.value.duration) * 100))
const puppetDuration = computed(() => `${active.value.duration / speed.value}s`)

let timer = 0

function tick() {
  if (!playing.value) return
  elapsed.value += 0.1 * speed.value
  if (elapsed.value >= active.value.duration) elapsed.value = 0
}

function fmt(t: number) {
  const s = Math.floor(t)
  return `0:${String(s).padStart(2, '0')}`
}

function selectClip(id: string) {
  if (id === activeId.value) {
    playing.value = true
    return
  }
  activeId.value = id
  elapsed.value = 0
  playing.value = true
}

function cycleSpeed() {
  const i = SPEEDS.indexOf(speed.value)
  speed.value = SPEEDS[(i + 1) % SPEEDS.length]
}

onMounted(() => {
  timer = window.setInterval(tick, 100)
})
onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  <ChapterShell id="05" :threshold="0.55">
    <div class="theater">
      <header class="lede m-rise">
        <p class="kicker">THE LITTLE THEATER · 纸偶剧场</p>
        <p class="txt">
          幕布后面住着四个很短的片段。它们不会真的结束——演到最后，会自己回到开头，再演一遍。挑一段胶片，看看它们在纸上怎么动。
        </p>
      </header>

      <!-- 主舞台 -->
      <section class="stage-frame" :aria-label="`正在播放：${active.name}`">
        <div class="valance" aria-hidden="true"></div>

        <div class="screen">
          <div class="spot" aria-hidden="true"></div>

          <div class="puppet-area" :class="`act-${active.kind}`">
            <div class="rig" aria-hidden="true">
              <span class="bar"></span>
              <span class="wire"></span>
            </div>
            <div
              class="puppet"
              :class="{ paused: !playing }"
              :style="{ animationDuration: puppetDuration }"
            >
              <img :src="poster" :alt="`${active.owner}的纸偶`" loading="lazy" />
            </div>
            <span class="shadow" aria-hidden="true"></span>
          </div>

          <div class="caption">
            <p class="owner">{{ active.owner }} · 片段 {{ activeIndex + 1 }}</p>
            <h2>{{ active.name }}</h2>
            <p class="line">{{ active.line }}</p>
          </div>
        </div>

        <div class="controls">
          <button
            type="button"
            class="play"
            :aria-label="playing ? '暂停' : '播放'"
            @click="playing = !playing"
          >
            {{ playing ? '❚❚' : '▶' }}
          </button>
          <div
            class="timeline"
            role="progressbar"
            aria-label="播放进度"
            :aria-valuenow="Math.round(progress)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span class="fill" :style="{ width: progress + '%' }"></span>
          </div>
          <span class="time">{{ fmt(elapsed) }} / {{ fmt(active.duration) }}</span>
          <button type="button" class="speed" aria-label="切换播放倍速" @click="cycleSpeed">
            {{ speed }}×
          </button>
        </div>
      </section>

      <!-- 胶片网格 -->
      <div class="clips" role="tablist" aria-label="选择动作片段">
        <button
          v-for="c in CLIPS_DATA"
          :key="c.id"
          type="button"
          class="clip"
          role="tab"
          :aria-selected="c.id === activeId"
          :class="{ on: c.id === activeId }"
          @click="selectClip(c.id)"
        >
          <span class="poster">
            <img
              :src="CHARACTERS_DATA.find((p) => p.id === c.characterId)?.avatar ?? ''"
              :alt="`${c.owner}的片段封面`"
              loading="lazy"
            />
            <span class="dur">{{ c.duration }}s</span>
          </span>
          <span class="cn">{{ c.name }}</span>
          <span class="owner">{{ c.owner }}</span>
        </button>
      </div>

      <p class="tip">点击胶片切换片段 · ❚❚ / ▶ 暂停或继续 · 右上角切换倍速</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.lede {
  padding: 0 0 1.3rem;
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

/* 剧院外框 */
.stage-frame {
  border: 3px solid var(--ink);
  border-radius: 18px 6px 18px 6px;
  background: var(--bg2);
  box-shadow: var(--shadow-lift);
  overflow: hidden;
}
.valance {
  height: 16px;
  background:
    repeating-linear-gradient(90deg, var(--yellow) 0 14px, var(--orange) 14px 28px);
  border-bottom: 3px solid var(--ink);
  opacity: 0.9;
}

.screen {
  position: relative;
  height: clamp(340px, 52vh, 460px);
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 26%, color-mix(in srgb, var(--yellow) 34%, transparent), transparent 62%),
    repeating-linear-gradient(90deg, var(--deep) 0 12px, color-mix(in srgb, var(--deep) 82%, var(--ink)) 12px 24px);
}
/* 追光 */
.spot {
  position: absolute;
  left: 50%;
  top: -6%;
  width: 62%;
  aspect-ratio: 1 / 1.25;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--yellow) 26%, transparent), transparent 64%);
  animation: spot-breathe var(--dur-breathe) ease-in-out infinite;
  pointer-events: none;
}
@keyframes spot-breathe {
  0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.05); }
}

/* 纸偶 */
.puppet-area {
  position: absolute;
  left: 50%;
  top: 12%;
  width: clamp(170px, 30%, 240px);
  aspect-ratio: 3 / 4;
  transform: translateX(-50%);
}
.puppet {
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  background: var(--cream);
  border: 3px solid var(--bg2);
  outline: 2px solid var(--rule);
  border-radius: 14px 4px 14px 4px;
  box-shadow: 0 10px 0 color-mix(in srgb, var(--ink) 22%, transparent);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  transform-origin: 50% 92%;
}
.puppet.paused {
  animation-play-state: paused;
}
.puppet img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px 2px 10px 2px;
}

/* 悬丝 */
.rig {
  position: absolute;
  left: 50%;
  top: -46px;
  width: 76%;
  transform: translateX(-50%);
  pointer-events: none;
}
.bar {
  display: block;
  height: 4px;
  background: var(--ink);
  border-radius: 999px;
  opacity: 0.8;
}
.wire {
  display: block;
  width: 1.5px;
  height: 44px;
  margin: 0 auto;
  background: var(--ink);
  opacity: 0.5;
}
.shadow {
  position: absolute;
  left: 50%;
  bottom: -18px;
  width: 70%;
  height: 20px;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--ink) 48%, transparent), transparent 70%);
}

/* 片段动画（只动 transform / opacity） */
.act-roll .puppet { animation-name: act-roll; }
.act-stretch .puppet { animation-name: act-stretch; }
.act-sway .puppet { animation-name: act-sway; }
.act-spin .puppet { animation-name: act-spin; }
@keyframes act-roll {
  0% { transform: translateX(-30px) rotate(-8deg); }
  50% { transform: translateX(30px) rotate(8deg) translateY(-6px); }
  100% { transform: translateX(-30px) rotate(-8deg); }
}
@keyframes act-stretch {
  0%, 100% { transform: translateY(0) scaleY(1); }
  40% { transform: translateY(-12px) scaleY(1.07) rotate(-3deg); }
  70% { transform: translateY(0) scaleY(0.96) rotate(3deg); }
}
@keyframes act-sway {
  0%, 100% { transform: rotate(-6deg); }
  50% { transform: rotate(6deg) translateY(-6px); }
}
@keyframes act-spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(-360deg); }
}

/* 字幕 */
.caption {
  position: absolute;
  left: 1.1rem;
  bottom: 1.1rem;
  max-width: min(56%, 340px);
  padding: 0.7rem 0.95rem;
  background: color-mix(in srgb, var(--cream) 92%, transparent);
  border: 2px solid var(--ink);
  border-radius: 3px 14px 3px 14px;
  box-shadow: var(--shadow-pop);
}
.caption .owner {
  margin: 0 0 0.15rem;
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: var(--orange);
  font-weight: 700;
}
.caption h2 {
  margin: 0 0 0.25rem;
  font-family: var(--f-title);
  font-size: 1.12rem;
  color: var(--ink);
  letter-spacing: 0.08em;
}
.caption .line {
  margin: 0;
  font-size: 0.74rem;
  line-height: 1.7;
  color: var(--deep);
}

/* 播放器控件 */
.controls {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 0.9rem;
  background: var(--cream);
  border-top: 3px solid var(--ink);
}
.play {
  width: 40px;
  height: 34px;
  padding: 0;
  background: var(--yellow);
  border: 2.5px solid var(--ink);
  border-radius: 10px 3px 10px 3px;
  box-shadow: var(--shadow-pop);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s var(--ease-pop);
}
.play:hover {
  transform: translateY(-2px);
}
.timeline {
  flex: 1;
  height: 7px;
  border: 1.5px solid var(--rule);
  border-radius: 999px;
  background: var(--bg2);
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  background: var(--orange);
  transition: width 0.1s linear;
}
.time {
  font-family: var(--f-num);
  font-size: 0.68rem;
  color: var(--muted);
  white-space: nowrap;
}
.speed {
  padding: 0.2rem 0.55rem;
  background: var(--bg2);
  border: 2px solid var(--deep);
  border-radius: 8px 3px 8px 3px;
  font-family: var(--f-num);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--deep);
  cursor: pointer;
}

/* 胶片网格 */
.clips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.9rem;
  margin-top: 1.2rem;
}
.clip {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  padding: 0.95rem 0.6rem 1.15rem;
  background: var(--bg2);
  border: 2px solid var(--rule);
  border-radius: 14px 4px 14px 4px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.3s var(--ease-pop), border-color 0.2s, box-shadow 0.2s;
}
.clip::before,
.clip::after {
  content: '';
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  height: 9px;
  background: var(--ink);
  background-image: radial-gradient(circle, var(--bg2) 2px, transparent 2.5px);
  background-size: 12px 9px;
  border-radius: 3px;
  opacity: 0.75;
}
.clip::before {
  top: 0.28rem;
}
.clip::after {
  bottom: 0.28rem;
}
.clip:hover,
.clip:focus-visible {
  transform: translateY(-4px);
  border-color: var(--orange);
  outline: none;
}
.clip.on {
  border-color: var(--ink);
  background: var(--cream);
  box-shadow: var(--shadow-pop);
}
.poster {
  position: relative;
  display: block;
  border-radius: 10px 2px 10px 2px;
  overflow: hidden;
}
.poster img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: center 30%;
}
.dur {
  position: absolute;
  right: 0.35rem;
  bottom: 0.3rem;
  padding: 0 0.4rem;
  background: var(--cream);
  border: 1.5px solid var(--ink);
  border-radius: 4px;
  font-family: var(--f-num);
  font-size: 0.62rem;
}
.clip .cn {
  margin-top: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
}
.clip .owner {
  font-size: 0.66rem;
  color: var(--muted);
}
.tip {
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
  margin: 1.1rem 0 0.4rem;
}

@media (max-width: 640px) {
  .screen {
    height: 360px;
  }
  .puppet-area {
    top: 14%;
    width: clamp(140px, 38%, 190px);
  }
  .caption {
    left: 0.6rem;
    right: 0.6rem;
    bottom: 0.6rem;
    max-width: none;
  }
  .caption .line {
    font-size: 0.7rem;
    line-height: 1.55;
  }
  .time {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .spot,
  .puppet-area,
  .puppet {
    animation: none !important;
  }
}
</style>
