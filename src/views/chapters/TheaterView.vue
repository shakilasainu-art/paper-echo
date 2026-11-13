<script setup lang="ts">
/**
 * 05 动作剧场
 * 元元的六格基础动作库：点击动作卡，舞台立即切换立绘并表演一次；
 * 再次点击当前动作可重新播放。所有动作仅使用 transform / opacity。
 */
import { computed, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'

interface ActionItem {
  id: string
  name: string
  en: string
  line: string
  img: string
}

const ACTIONS: ActionItem[] = [
  {
    id: 'walk',
    name: '快乐走路',
    en: 'WALK',
    line: '迈开小脚，把好心情带向下一站。',
    img: new URL('../../assets/img/pe_action_walk.webp', import.meta.url).href,
  },
  {
    id: 'heart',
    name: '双手比心',
    en: 'HEART',
    line: '双手比心，把今天的喜欢认真送给你。',
    img: new URL('../../assets/img/pe_action_heart.webp', import.meta.url).href,
  },
  {
    id: 'wave',
    name: '热情挥手',
    en: 'WAVE',
    line: '举起小爪子，和新朋友打个招呼。',
    img: new URL('../../assets/img/pe_action_wave.webp', import.meta.url).href,
  },
  {
    id: 'donut',
    name: '吃甜甜圈',
    en: 'DONUT',
    line: '坐稳扶好，香甜的一口马上送到。',
    img: new URL('../../assets/img/pe_action_donut.webp', import.meta.url).href,
  },
  {
    id: 'sit',
    name: '抱膝坐坐',
    en: 'REST',
    line: '收起小脚，陪你安静地待一会儿。',
    img: new URL('../../assets/img/pe_action_sit.webp', import.meta.url).href,
  },
  {
    id: 'eat',
    name: '开心吃饭',
    en: 'EAT',
    line: '捧起小碗，把派对能量补得满满的。',
    img: new URL('../../assets/img/pe_action_eat.webp', import.meta.url).href,
  },
]

const active = ref(0)
const runId = ref(0)
const current = computed(() => ACTIONS[active.value])

function perform(index: number) {
  active.value = index
  // 即使重复选择同一个动作，也通过更换 key 重播动画
  runId.value += 1
}
</script>

<template>
  <ChapterShell id="05" :threshold="0.35">
    <div class="theater">
      <header class="lede">
        <p class="kicker">YUANYUAN'S LITTLE STAGE · 元元动作库</p>
        <p class="txt">
          六个基础动作已经排好队。点一张动作卡，元元就会走到舞台中央，当场做给你看。
        </p>
      </header>

      <section class="stage" :aria-label="`元元的动作舞台：${current.name}`">
        <div class="valance" aria-hidden="true"></div>
        <span class="curtain left" aria-hidden="true"></span>
        <span class="curtain right" aria-hidden="true"></span>
        <div class="spotlight" aria-hidden="true"></div>
        <span class="spark s1" aria-hidden="true">✦</span>
        <span class="spark s2" aria-hidden="true">✧</span>
        <span class="spark s3" aria-hidden="true">✦</span>

        <span class="counter">ACTION {{ String(active + 1).padStart(2, '0') }} / 06</span>

        <div class="actor">
          <span class="ground" aria-hidden="true"></span>
          <div :key="`${current.id}-${runId}`" class="performer" :class="`move-${current.id}`">
            <img :src="current.img" :alt="`元元${current.name}`" />
            <template v-if="current.id === 'heart'">
              <span class="love l1" aria-hidden="true">♥</span>
              <span class="love l2" aria-hidden="true">♥</span>
              <span class="love l3" aria-hidden="true">♥</span>
            </template>
          </div>
        </div>

        <div :key="current.id" class="caption">
          <p class="eyebrow">YUANYUAN · BASIC MOVE</p>
          <h2>{{ current.name }}</h2>
          <p class="line">{{ current.line }}</p>
        </div>
      </section>

      <div class="actions" role="group" aria-label="元元的六个基础动作">
        <button
          v-for="(action, i) in ACTIONS"
          :key="action.id"
          type="button"
          class="action"
          :class="{ on: i === active }"
          :aria-label="`让元元表演${action.name}`"
          :aria-pressed="i === active"
          @click="perform(i)"
        >
          <span class="thumb">
            <span class="no">{{ String(i + 1).padStart(2, '0') }}</span>
            <img :src="action.img" :alt="action.name" loading="lazy" />
            <span class="play-mark" aria-hidden="true">▶</span>
          </span>
          <span class="name">{{ action.name }}</span>
          <span class="en">{{ action.en }}</span>
        </button>
      </div>

      <p class="tip">点击动作卡，元元当场表演 · 再点当前动作可重演</p>
      <p class="sr-only" aria-live="polite">元元表演：{{ current.name }}</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.lede {
  padding-bottom: 1.25rem;
}
.kicker {
  margin: 0 0 0.3rem;
  color: var(--orange);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}
.txt {
  max-width: 38em;
  margin: 0;
  color: var(--ink);
  font-size: 0.94rem;
  line-height: 1.95;
}

/* ---------- 小舞台 ---------- */
.stage {
  position: relative;
  height: clamp(370px, 52vh, 470px);
  overflow: hidden;
  border: 3px solid var(--ink);
  border-radius: 24px 8px 24px 8px;
  background:
    radial-gradient(ellipse at 50% 28%, color-mix(in srgb, var(--yellow) 42%, transparent) 0%, transparent 55%),
    linear-gradient(180deg, var(--cream) 0%, var(--bg2) 100%);
  box-shadow: 7px 8px 0 color-mix(in srgb, var(--ink) 15%, transparent);
}
.valance {
  position: absolute;
  inset: 0 0 auto;
  z-index: 6;
  height: 22px;
  border-bottom: 3px solid var(--ink);
  background: repeating-linear-gradient(90deg, var(--yellow) 0 30px, var(--orange) 30px 60px);
}
.valance::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 19px;
  height: 13px;
  background: radial-gradient(circle at 15px 0, var(--yellow) 14px, transparent 15px) 0 0 / 60px 13px repeat-x;
}
.curtain {
  position: absolute;
  top: 22px;
  bottom: 0;
  z-index: 1;
  width: 15%;
  background: repeating-linear-gradient(
    90deg,
    var(--deep) 0 18px,
    color-mix(in srgb, var(--deep) 78%, var(--ink)) 18px 36px
  );
  opacity: 0.92;
}
.curtain.left {
  left: 0;
  clip-path: polygon(0 0, 100% 0, 65% 58%, 92% 100%, 0 100%);
}
.curtain.right {
  right: 0;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 8% 100%, 35% 58%);
}
.spotlight {
  position: absolute;
  left: 50%;
  top: 12px;
  width: 68%;
  height: 88%;
  transform: translateX(-50%);
  background: radial-gradient(ellipse at 50% 38%, color-mix(in srgb, var(--cream) 88%, transparent), transparent 66%);
  pointer-events: none;
}
.counter {
  position: absolute;
  right: 1.1rem;
  top: 3rem;
  z-index: 5;
  padding: 0.25rem 0.65rem;
  border: 2px solid var(--ink);
  border-radius: 999px;
  background: var(--cream);
  color: var(--deep);
  font-family: var(--f-num);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.spark {
  position: absolute;
  z-index: 2;
  color: var(--orange);
  font-size: 1.2rem;
  opacity: 0.65;
}
.s1 {
  left: 24%;
  top: 23%;
}
.s2 {
  right: 23%;
  top: 35%;
  font-size: 1.6rem;
}
.s3 {
  left: 29%;
  top: 56%;
  font-size: 0.85rem;
}

/* ---------- 元元 ---------- */
.actor {
  position: absolute;
  left: 50%;
  top: 9%;
  z-index: 3;
  width: clamp(205px, 31vw, 292px);
  height: 73%;
  transform: translateX(-50%);
}
.ground {
  position: absolute;
  left: 50%;
  bottom: 1%;
  width: 72%;
  height: 24px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--ink) 24%, transparent), transparent 70%);
}
.performer {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  transform-origin: 50% 88%;
  will-change: transform, opacity;
}
.performer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 7px color-mix(in srgb, var(--ink) 16%, transparent));
}

.move-walk {
  animation: act-walk 1.25s cubic-bezier(0.3, 0.75, 0.25, 1) both;
}
.move-heart {
  animation: act-heart 1.15s var(--ease-pop) both;
}
.move-wave {
  animation: act-wave 1.25s ease-in-out both;
}
.move-donut {
  animation: act-donut 1.15s var(--ease-pop) both;
}
.move-sit {
  animation: act-sit 1.05s var(--ease-pop) both;
}
.move-eat {
  animation: act-eat 1.2s ease-in-out both;
}

@keyframes act-walk {
  0% { opacity: 0; transform: translateX(-48px) translateY(4px) rotate(-6deg); }
  18% { opacity: 1; }
  36% { transform: translateX(-20px) translateY(-13px) rotate(4deg); }
  60% { transform: translateX(20px) translateY(0) rotate(-4deg); }
  80% { transform: translateX(5px) translateY(-8px) rotate(2deg); }
  100% { opacity: 1; transform: none; }
}
@keyframes act-heart {
  0% { opacity: 0; transform: scale(0.72) rotate(-6deg); }
  34% { opacity: 1; transform: scale(1.08) rotate(2deg); }
  56% { transform: scale(0.96) rotate(-1deg); }
  76% { transform: scale(1.025); }
  100% { opacity: 1; transform: none; }
}
@keyframes act-wave {
  0% { opacity: 0; transform: translateY(18px) rotate(-10deg); }
  22% { opacity: 1; }
  40% { transform: rotate(8deg); }
  60% { transform: rotate(-7deg); }
  80% { transform: rotate(4deg); }
  100% { opacity: 1; transform: none; }
}
@keyframes act-donut {
  0% { opacity: 0; transform: translateY(-24px) scale(0.86); }
  34% { opacity: 1; transform: translateY(3px) scale(1.035); }
  54% { transform: rotate(-3deg); }
  74% { transform: translateY(-5px) rotate(3deg); }
  100% { opacity: 1; transform: none; }
}
@keyframes act-sit {
  0% { opacity: 0; transform: translateY(-38px) scaleY(1.05); }
  42% { opacity: 1; transform: translateY(5px) scaleY(0.96); }
  68% { transform: translateY(-3px) scaleY(1.02); }
  100% { opacity: 1; transform: none; }
}
@keyframes act-eat {
  0% { opacity: 0; transform: translateY(14px) rotate(-3deg); }
  22% { opacity: 1; }
  40% { transform: translateY(-8px) rotate(2deg); }
  60% { transform: translateY(0) rotate(-2deg); }
  80% { transform: translateY(-4px) rotate(1deg); }
  100% { opacity: 1; transform: none; }
}

.love {
  position: absolute;
  z-index: 3;
  color: var(--pink);
  font-size: clamp(1.2rem, 2.6vw, 2rem);
  text-shadow: 0 2px 0 var(--cream);
  opacity: 0;
  animation: love-pop 0.85s var(--ease-pop) both;
}
.l1 {
  left: 12%;
  top: 39%;
  animation-delay: 0.32s;
}
.l2 {
  right: 10%;
  top: 26%;
  animation-delay: 0.43s;
}
.l3 {
  left: 43%;
  top: 7%;
  animation-delay: 0.54s;
}
@keyframes love-pop {
  0% { opacity: 0; transform: translateY(12px) scale(0.4) rotate(-10deg); }
  45% { opacity: 1; transform: translateY(-5px) scale(1.15) rotate(5deg); }
  100% { opacity: 0; transform: translateY(-28px) scale(0.9); }
}

/* ---------- 动作字幕 ---------- */
.caption {
  position: absolute;
  left: 1.35rem;
  bottom: 1.25rem;
  z-index: 4;
  width: min(31%, 310px);
  padding: 0.75rem 0.95rem 0.8rem;
  border: 2px solid var(--ink);
  border-radius: 4px 16px 4px 16px;
  background: color-mix(in srgb, var(--cream) 94%, transparent);
  box-shadow: var(--shadow-pop);
  animation: caption-in 0.35s ease-out both;
}
.eyebrow {
  margin: 0 0 0.15rem;
  color: var(--orange);
  font-family: var(--f-num);
  font-size: 0.59rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.caption h2 {
  margin: 0 0 0.25rem;
  color: var(--ink);
  font-family: var(--f-title);
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  letter-spacing: 0.08em;
}
.line {
  margin: 0;
  color: var(--deep);
  font-size: 0.73rem;
  line-height: 1.65;
}
@keyframes caption-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}

/* ---------- 六格动作面板 ---------- */
.actions {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(0.55rem, 1.2vw, 0.9rem);
  margin-top: 1.35rem;
}
.action {
  min-width: 0;
  padding: 0.5rem 0.5rem 0.6rem;
  border: 2px solid var(--rule);
  border-radius: 15px 5px 15px 5px;
  background: var(--bg2);
  color: var(--ink);
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop), border-color 0.2s, box-shadow 0.2s;
}
.action:nth-child(3n + 1) .thumb {
  background: color-mix(in srgb, var(--sky) 43%, var(--cream));
}
.action:nth-child(3n + 2) .thumb {
  background: color-mix(in srgb, var(--pink) 32%, var(--cream));
}
.action:nth-child(3n) .thumb {
  background: color-mix(in srgb, var(--yellow) 42%, var(--cream));
}
.action:hover {
  transform: translateY(-4px);
  border-color: var(--orange);
}
.action:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 3px;
}
.action.on {
  transform: translateY(-4px);
  border-color: var(--ink);
  background: var(--cream);
  box-shadow: 3px 4px 0 color-mix(in srgb, var(--ink) 18%, transparent);
}
.thumb {
  position: relative;
  display: block;
  aspect-ratio: 1.08 / 1;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 11px 3px 11px 3px;
}
.thumb img {
  position: absolute;
  inset: 9% 5% 3%;
  width: 90%;
  height: 88%;
  object-fit: contain;
  transition: transform 0.25s var(--ease-pop);
}
.action:hover .thumb img,
.action.on .thumb img {
  transform: scale(1.06);
}
.no {
  position: absolute;
  left: 0.35rem;
  top: 0.2rem;
  z-index: 2;
  color: var(--deep);
  font-family: var(--f-num);
  font-size: 0.62rem;
  font-weight: 700;
}
.play-mark {
  position: absolute;
  right: 0.3rem;
  bottom: 0.3rem;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  padding-left: 2px;
  box-sizing: border-box;
  border: 1.5px solid var(--ink);
  border-radius: 50%;
  background: var(--yellow);
  font-size: 0.52rem;
  opacity: 0;
  transform: scale(0.7);
  transition: transform 0.2s var(--ease-pop), opacity 0.2s;
}
.action:hover .play-mark,
.action.on .play-mark {
  opacity: 1;
  transform: scale(1);
}
.name {
  display: block;
  margin-top: 0.4rem;
  font-family: var(--f-title);
  font-size: clamp(0.72rem, 1.2vw, 0.88rem);
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.en {
  display: block;
  margin-top: 0.08rem;
  color: var(--muted);
  font-family: var(--f-num);
  font-size: 0.56rem;
  letter-spacing: 0.14em;
}
.tip {
  margin: 1.05rem 0 0.35rem;
  color: var(--muted);
  font-size: 0.76rem;
  text-align: center;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .stage {
    height: 420px;
  }
  .actor {
    top: 8%;
    width: clamp(180px, 51vw, 230px);
    height: 60%;
  }
  .curtain {
    width: 11%;
  }
  .counter {
    right: 0.65rem;
    top: 2.65rem;
    font-size: 0.56rem;
  }
  .spark.s1 {
    left: 15%;
  }
  .spark.s2 {
    right: 13%;
  }
  .caption {
    left: 0.75rem;
    right: 0.75rem;
    bottom: 0.75rem;
    width: auto;
    padding: 0.55rem 0.75rem 0.6rem;
    text-align: center;
  }
  .caption h2 {
    margin-bottom: 0.12rem;
  }
  .actions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
    margin-top: 1rem;
  }
  .name {
    font-size: clamp(0.68rem, 2.8vw, 0.82rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .performer,
  .love,
  .caption {
    animation: none !important;
  }
  .action,
  .thumb img,
  .play-mark {
    transition: none;
  }
  .action:hover,
  .action.on,
  .action:hover .thumb img,
  .action.on .thumb img {
    transform: none;
  }
}
</style>
