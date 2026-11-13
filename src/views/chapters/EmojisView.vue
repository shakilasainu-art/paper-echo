<script setup lang="ts">
/**
 * 04 表情收藏（改造版）
 * 场景：悬浮的贴纸慢慢聚拢，贴成一面便签墙
 * 交互：点任意表情弹出预览卡片（弹出动效参考视频：带弹性放大 + 提示标签）
 * 卡片字段参考图一：爱心 / 评论 + 中文名 + 英文名
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'

interface Emo {
  cn: string
  en: string
  tone: string
  img: string
}

const EMOJIS: Emo[] = [
  { cn: '思考中', en: 'THINKING', tone: '#fbe3c4', img: new URL('../../assets/img/pe_emo_thinking.webp', import.meta.url).href },
  { cn: '狂喜', en: 'EXCITED', tone: '#ffe6a8', img: new URL('../../assets/img/pe_emo_excited.webp', import.meta.url).href },
  { cn: '好害羞', en: 'BLUSH', tone: '#fbd6d9', img: new URL('../../assets/img/pe_emo_blush.webp', import.meta.url).href },
  { cn: '嗨～来啦', en: 'GREET', tone: '#cfe7f6', img: new URL('../../assets/img/pe_emo_greet.webp', import.meta.url).href },
  { cn: '送给你', en: 'ADORE', tone: '#f9d4cf', img: new URL('../../assets/img/pe_emo_adore.webp', import.meta.url).href },
  { cn: '懒懒的', en: 'DREAMY', tone: '#dfe7d2', img: new URL('../../assets/img/pe_emo_dreamy.webp', import.meta.url).href },
  { cn: '帅炸了', en: 'SWAG', tone: '#dcd8f0', img: new URL('../../assets/img/pe_emo_swag.webp', import.meta.url).href },
  { cn: '尽情摇摆', en: 'GROOVE', tone: '#cfe9df', img: new URL('../../assets/img/pe_emo_groove.webp', import.meta.url).href },
]

/* 每张贴纸的入场偏移 / 角度 / 贴纸倾斜，固定下来避免重渲染抖动 */
const SCATTER = [
  { dx: -46, dy: -38, r: -14, t: -3.5 },
  { dx: 38, dy: -52, r: 12, t: 2.8 },
  { dx: -34, dy: 30, r: 9, t: -2.2 },
  { dx: 52, dy: 26, r: -11, t: 3.6 },
  { dx: -54, dy: 42, r: 7, t: 2.4 },
  { dx: 44, dy: -34, r: -9, t: -3.2 },
  { dx: -28, dy: -46, r: 15, t: 3.1 },
  { dx: 36, dy: 48, r: -12, t: -2.6 },
]

const settled = ref(false)
const openIndex = ref<number | null>(null)
const active = computed(() => (openIndex.value === null ? null : EMOJIS[openIndex.value]))

let timer: number | undefined
onMounted(() => {
  timer = window.setTimeout(() => (settled.value = true), 260)
})

function openCard(i: number) {
  openIndex.value = i
}
function closeCard() {
  openIndex.value = null
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') closeCard()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (timer) window.clearTimeout(timer)
})
</script>

<template>
  <ChapterShell id="04" :threshold="0.3">
    <div class="wall">
      <div class="plaster" aria-hidden="true"></div>

      <div class="notes" :class="{ settled }">
        <button
          v-for="(e, i) in EMOJIS"
          :key="e.en"
          type="button"
          class="note"
          :class="{ on: openIndex === i }"
          :style="{
            '--dx': SCATTER[i].dx + 'px',
            '--dy': SCATTER[i].dy + 'px',
            '--r': SCATTER[i].r + 'deg',
            '--t': SCATTER[i].t + 'deg',
            '--tone': e.tone,
            '--d': 0.06 * i + 's',
          }"
          :aria-label="`${e.cn} ${e.en}`"
          @click="openCard(i)"
        >
          <span class="paper">
            <span class="tape" aria-hidden="true"></span>
            <span class="bob">
              <img :src="e.img" :alt="`${e.cn}表情`" loading="lazy" />
            </span>
          </span>
          <span class="cap">{{ e.cn }}</span>
        </button>
      </div>

      <p class="hint">点点看 · 每张便签都藏着一个表情</p>

      <!-- 预览卡片 -->
      <Transition name="pop">
        <div v-if="active" class="preview" @click.self="closeCard">
          <div class="card" role="dialog" :aria-label="`${active.cn} ${active.en}`">
            <button class="close" type="button" aria-label="关闭" @click="closeCard">✕</button>
            <span class="tag">✦ {{ active.en }}</span>
            <div class="stage">
              <img :src="active.img" :alt="`${active.cn}表情`" />
            </div>
            <div class="foot">
              <span class="acts" aria-hidden="true">
                <b>♥</b>
                <b class="dim">♡</b>
                <b class="cm">◷</b>
              </span>
              <span class="names">
                <em>{{ active.cn }}</em>
                <i>{{ active.en }}</i>
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </ChapterShell>
</template>

<style scoped>
/* ---------- 场景：一面墙 ---------- */
.wall {
  position: relative;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  min-height: min(80vh, 680px);
  padding: 2rem 1rem 2.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  overflow: hidden;
  border-radius: 0;
  --wall-1: #f4e9d6;
  --wall-2: #e6d6bd;
}

.plaster {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 250, 236, 0.9) 0%, transparent 55%),
    linear-gradient(180deg, var(--wall-1) 0%, var(--wall-2) 100%);
}
.plaster::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(120, 96, 66, 0.2) 100%);
}

/* ---------- 便签墙 ---------- */
.notes {
  position: relative;
  z-index: 2;
  width: min(94vw, 880px);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.5rem, 1.4vw, 1.1rem);
}

.note {
  position: relative;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 未聚拢前：散落在四周，透明 */
  transform: rotate(var(--r)) translate(var(--dx), var(--dy)) scale(0.72);
  opacity: 0;
  transition:
    transform 0.95s cubic-bezier(0.18, 0.9, 0.22, 1) var(--d),
    opacity 0.55s ease var(--d);
}
.notes.settled .note {
  transform: rotate(0) translate(0, 0) scale(1);
  opacity: 1;
}

.paper {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1.14;
  background: var(--tone);
  border-radius: 4px 4px 12px 4px;
  box-shadow: 3px 5px 0 rgba(120, 96, 66, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  transform: rotate(calc(var(--t) * 0.55));
  transition: transform 0.3s var(--ease-pop), box-shadow 0.3s;
  overflow: hidden;
}
.note:hover .paper,
.note.on .paper {
  transform: rotate(0) translateY(-5px) scale(1.03);
  box-shadow: 4px 9px 0 rgba(120, 96, 66, 0.22);
}
/* 胶带 */
.tape {
  position: absolute;
  left: 50%;
  top: -7px;
  width: 46%;
  height: 16px;
  transform: translateX(-50%) rotate(-1.5deg);
  background: rgba(255, 255, 255, 0.62);
  border-left: 1px dashed rgba(255, 255, 255, 0.9);
  border-right: 1px dashed rgba(255, 255, 255, 0.9);
}
.bob {
  position: absolute;
  inset: 10% 8% 6%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notes.settled .note:nth-child(odd) .bob {
  animation: bob 4.6s ease-in-out infinite alternate;
}
.notes.settled .note:nth-child(even) .bob {
  animation: bob 5.4s ease-in-out -1.6s infinite alternate-reverse;
}
@keyframes bob {
  from {
    transform: translateY(-2px) rotate(-1.4deg);
  }
  to {
    transform: translateY(3px) rotate(1.6deg);
  }
}
.bob img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 3px 3px rgba(90, 70, 45, 0.16));
}

.cap {
  margin-top: 0.34rem;
  font-family: var(--f-title);
  font-size: clamp(0.6rem, 0.95vw, 0.76rem);
  color: var(--deep);
  letter-spacing: 0.06em;
}

.hint {
  position: relative;
  z-index: 2;
  margin: 0;
  font-size: 0.8rem;
  color: var(--deep);
  background: #fffdf4;
  border: 2px solid var(--rule);
  border-radius: 999px;
  padding: 0.28rem 1.05rem;
  box-shadow: var(--shadow-pop);
}

/* ---------- 预览卡片 ---------- */
.preview {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  background: rgba(51, 64, 42, 0.34);
  backdrop-filter: blur(3px);
}

.card {
  position: relative;
  width: min(88vw, 330px);
  padding: 0.85rem 0.85rem 0.7rem;
  background: #fffdf6;
  border: 3px solid var(--ink);
  border-radius: 16px;
  box-shadow: 8px 10px 0 rgba(51, 64, 42, 0.28);
}

.close {
  position: absolute;
  right: -10px;
  top: -12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2.5px solid var(--ink);
  background: var(--yellow);
  color: var(--ink);
  font-size: 0.78rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 2px 2px 0 var(--rule);
}

/* 左上小标签（参考视频里贴在角色旁的名字条） */
.tag {
  position: absolute;
  left: -8px;
  top: -13px;
  padding: 0.14rem 0.5rem;
  background: var(--yellow);
  border: 2px solid var(--ink);
  border-radius: 7px;
  font-family: var(--f-num);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--ink);
  transform: rotate(-3deg);
}

.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: radial-gradient(circle at 50% 45%, #fff 0%, #f7eeda 100%);
  border-radius: 10px;
  border: 1px solid var(--rule);
  overflow: hidden;
}
.stage img {
  max-width: 78%;
  max-height: 84%;
  object-fit: contain;
  filter: drop-shadow(0 4px 5px rgba(90, 70, 45, 0.16));
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.5rem 0.15rem 0.05rem;
}
.acts {
  display: flex;
  gap: 0.3rem;
  font-size: 0.86rem;
  color: #d9534f;
  line-height: 1;
}
.acts .dim {
  color: var(--rule);
}
.acts .cm {
  color: var(--deep);
  opacity: 0.7;
}
.names {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
}
.names em {
  font-style: normal;
  font-family: var(--f-title);
  font-size: 0.86rem;
  color: var(--ink);
}
.names i {
  font-style: normal;
  font-family: var(--f-num);
  font-size: 0.56rem;
  letter-spacing: 0.2em;
  color: var(--deep);
  opacity: 0.8;
}

/* 弹出：弹性放大 + 轻微旋转（参考视频里贴纸弹出来的手感） */
.pop-enter-active {
  transition: opacity 0.2s ease;
}
.pop-leave-active {
  transition: opacity 0.2s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
}
.pop-enter-active .card {
  animation: card-pop 0.46s cubic-bezier(0.2, 1.2, 0.3, 1) both;
}
@keyframes card-pop {
  0% {
    transform: scale(0.72) rotate(-4deg);
    opacity: 0;
  }
  62% {
    transform: scale(1.04) rotate(1.4deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

/* ---------- 移动端 ---------- */
@media (max-width: 760px) {
  .wall {
    min-height: 74vh;
    padding: 1.4rem 0.6rem 1.6rem;
  }
  .notes {
    width: min(98vw, 520px);
    grid-template-columns: repeat(4, 1fr);
    gap: 0.4rem;
  }
  .cap {
    font-size: 0.5rem;
    margin-top: 0.2rem;
  }
  .tape {
    height: 11px;
    top: -5px;
  }
  .hint {
    font-size: 0.7rem;
  }
  .stage {
    height: 168px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .note,
  .paper,
  .bob {
    transition-duration: 1ms;
    animation: none;
  }
  .pop-enter-active .card {
    animation: none;
  }
}
</style>
