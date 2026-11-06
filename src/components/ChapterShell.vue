<script setup lang="ts">
/**
 * ChapterShell —— 板块壳（技术方案 §05 / M2）
 * 统一提供：返回首页 ◀ ｜ 标题 ｜ 内容插槽 ｜ 「点亮并返回」
 * 进入即 visit（locked → available）
 * 阅读完成度达标（默认 90%）后「点亮」按钮才可用；已点亮则直接可用
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { chapterMeta, type ChapterId } from '../config/chapters'
import { useProgress } from '../stores/progress'

const props = withDefaults(defineProps<{ id: ChapterId; threshold?: number }>(), {
  threshold: 0.9,
})

const router = useRouter()
const progress = useProgress()
const meta = chapterMeta(props.id)!
const lit = computed(() => progress.data.fragments[props.id] === 'lit')

const scrolled = ref(0)
const ready = computed(() => lit.value || scrolled.value >= props.threshold)

function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (max <= 0) {
    scrolled.value = 1 // 内容短于视口，视为已读完
    return
  }
  scrolled.value = Math.min(1, Math.max(0, window.scrollY / max))
}

onMounted(() => {
  progress.visit(props.id)
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  window.addEventListener('resize', updateScroll)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll)
  window.removeEventListener('resize', updateScroll)
})

function lightAndReturn() {
  if (!ready.value) return
  if (!lit.value) progress.light(props.id)
  router.push('/home')
}
</script>

<template>
  <div class="chapter">
    <header class="ch-head m-rise">
      <button type="button" class="back" @click="router.push('/home')">◀ 返回首页</button>
      <h1 class="title">{{ id }} · {{ meta.title }} <span aria-hidden="true">{{ meta.emoji }}</span></h1>
    </header>

    <main class="ch-body">
      <slot />
    </main>

    <footer class="ch-foot">
      <div v-if="!ready" class="read-hint" role="status">
        <span class="txt">继续向下阅读，读懂这一页记忆</span>
        <span class="bar" aria-hidden="true">
          <span class="fill" :style="{ width: Math.round(scrolled * 100) + '%' }"></span>
        </span>
      </div>
      <button type="button" class="btn-primary" :disabled="!ready" @click="lightAndReturn">
        {{ lit ? '已点亮 ✓' : ready ? '✦ 点亮并返回' : '尚未读完' }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.chapter {
  min-height: 100dvh;
  max-width: 980px;
  margin: 0 auto;
  padding: 1.2rem 1rem 2rem;
  display: flex;
  flex-direction: column;
}
.ch-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px dashed var(--rule);
  margin-bottom: 1.4rem;
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
.back:hover {
  transform: translateY(-3px);
}
.title {
  font-family: var(--f-title);
  font-size: 1.3rem;
  margin: 0;
  text-align: right;
}
.ch-body {
  flex: 1;
}
.ch-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding-top: 1.5rem;
}
.read-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: min(240px, 80%);
}
.txt {
  font-size: 0.78rem;
  color: var(--muted);
}
.bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--bg2);
  border: 1.5px solid var(--rule);
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  background: var(--yellow);
  transition: width 0.2s linear;
}
</style>
