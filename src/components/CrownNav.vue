<script setup lang="ts">
/**
 * CrownNav —— 皇冠导航弹窗（技术方案 §05）
 * Teleport 至 body ｜ Esc/点击遮罩关闭 ｜ 打开时焦点圈定在面板
 * 7 个板块入口 + HUD 进度；07 记忆跃迁需 7/7 点亮
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CHAPTERS } from '../config/chapters'
import { CROWN_BAND, CROWN_BODY, CROWN_VIEWBOX } from '../config/crown'
import { useProgress } from '../stores/progress'
import HudSlots from './HudSlots.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()
const progress = useProgress()
const panel = ref<HTMLElement | null>(null)
const hint = ref('')

let hintTimer = 0
function showHint(msg: string) {
  hint.value = msg
  window.clearTimeout(hintTimer)
  hintTimer = window.setTimeout(() => (hint.value = ''), 2200)
}

watch(
  () => props.open,
  (open) => {
    hint.value = ''
    if (open) {
      document.addEventListener('keydown', onKeydown)
      nextTick(() => panel.value?.focus())
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  window.clearTimeout(hintTimer)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

function go(id: string) {
  if (id === '07' && !progress.gameUnlocked) {
    showHint(`还差 ${progress.chaptersRemaining} 块记忆碎片，记忆跃迁尚未开启`)
    return
  }
  emit('close')
  router.push(id === '07' ? '/game' : `/chapter/${id}`)
}

/** 重新观看开屏（每会话只自动播放一次，这里是手动触发） */
function replayIntro() {
  emit('close')
  router.push({ path: '/', query: { replay: '1' } })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="nav">
      <div v-if="open" class="wrap" @click.self="emit('close')">
        <div
          ref="panel"
          class="panel"
          role="dialog"
          aria-modal="true"
          aria-label="皇冠导航：选择一块拼图"
          tabindex="-1"
        >
          <svg class="crown m-pop-center" :viewBox="CROWN_VIEWBOX" aria-hidden="true">
            <path :d="CROWN_BODY" fill="var(--yellow)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" />
            <path :d="CROWN_BAND" fill="var(--orange)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round" />
          </svg>

          <p class="title">选择一块拼图，进入它的记忆</p>

          <div class="grid">
            <button
              v-for="c in CHAPTERS"
              :key="c.id"
              type="button"
              class="item"
              :class="{
                lit: progress.data.fragments[c.id] === 'lit',
                game: c.id === '07',
                'is-locked': c.id === '07' && !progress.gameUnlocked,
              }"
              @click="go(c.id)"
            >
              <span class="no">{{ c.id }}</span>
              <span class="em" aria-hidden="true">{{ c.emoji }}</span>
              <span class="t">{{ c.title }}</span>
              <span v-if="c.id === '07' && !progress.gameUnlocked" class="lock" aria-label="需集齐 6 块板块碎片">🔒</span>
            </button>
          </div>

          <HudSlots :lit="progress.litCount" />

          <p class="sub">已点亮 {{ progress.litCount }} / 7 块记忆碎片</p>

          <p v-if="hint" class="hint" role="alert">{{ hint }}</p>

          <button type="button" class="replay" @click="replayIntro">⏩ 重新观看开屏动画</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wrap {
  position: fixed;
  inset: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(51, 64, 42, 0.35);
}
.panel {
  width: min(480px, 100%);
  max-height: min(90dvh, 640px);
  overflow-y: auto;
  background: var(--cream);
  border: 3px solid var(--rule);
  border-radius: var(--r-panel);
  box-shadow: var(--shadow-lift);
  padding: 1.4rem 1.2rem 1.2rem;
  text-align: center;
}
.panel:focus {
  outline: none;
}
.crown {
  width: 58px;
  margin-bottom: 0.4rem;
}
.title {
  font-family: var(--f-title);
  font-size: 1.05rem;
  margin-bottom: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.6rem;
  margin-bottom: 1.1rem;
}
.item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.55rem 0.2rem 0.45rem;
  background: var(--bg2);
  border: 2px solid var(--rule);
  border-radius: 16px;
  font-size: 0.72rem;
  color: var(--muted);
  cursor: pointer;
  transition: transform 0.3s var(--ease-pop), border-color 0.2s, color 0.2s;
}
.item:hover,
.item:focus-visible {
  transform: translateY(-4px);
  border-color: var(--orange);
  color: var(--ink);
  outline: none;
}
.item.lit {
  background: var(--yellow);
  border-color: var(--ink);
  color: var(--ink);
  box-shadow: 2px 2px 0 var(--rule);
}
.item .no {
  font-family: var(--f-num);
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--deep);
}
.item .em {
  font-size: 1.15rem;
}
.lock {
  position: absolute;
  top: -8px;
  right: -6px;
  font-size: 0.8rem;
}

/* 07 未解锁：虚线 + 灰化 */
.item.is-locked {
  border-style: dashed;
  color: var(--locked-line);
}
.item.is-locked .no {
  color: var(--locked-line);
}

.sub {
  margin: 0.7rem 0 0;
  font-size: 0.76rem;
  color: var(--muted);
}
.hint {
  margin: 0.6rem 0 0;
  padding: 0.35rem 0.8rem;
  background: var(--bg2);
  border: 1.5px dashed var(--orange);
  border-radius: 10px;
  font-size: 0.76rem;
  color: var(--orange);
  line-height: 1.5;
}
.replay {
  margin-top: 0.9rem;
  padding: 0.25rem 0.9rem;
  background: none;
  border: none;
  border-bottom: 1.5px dashed var(--locked-line);
  border-radius: 0;
  font-size: 0.76rem;
  color: var(--muted);
  cursor: pointer;
}
.replay:hover {
  color: var(--ink);
  border-color: var(--orange);
}

/* 弹窗转场：遮罩淡入 + 面板回弹 */
.nav-enter-active { transition: opacity 0.25s; }
.nav-enter-active .panel { animation: pop-center var(--t-light) var(--ease-pop); }
.nav-leave-active { transition: opacity 0.2s; }
.nav-enter-from, .nav-leave-to { opacity: 0; }
</style>
