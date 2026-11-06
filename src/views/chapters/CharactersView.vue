<script setup lang="ts">
/**
 * 02 角色介绍（技术方案 §05 / M2）
 * 主动画：立绘自动浮现（pop）；点击下方角色卡切换（tab 语义）
 * 切换时旧内容淡出、新内容回弹入场
 */
import { computed, onMounted, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import { CHARACTERS_DATA } from '../../config/content'

const activeId = ref(CHARACTERS_DATA[0].id)
const active = computed(() => CHARACTERS_DATA.find((c) => c.id === activeId.value)!)

/** 首次进入时让立绘「自动浮现」 */
const appear = ref(false)
onMounted(() => {
  window.setTimeout(() => (appear.value = true), 120)
})
</script>

<template>
  <ChapterShell id="02" :threshold="0.6">
    <div class="chars">
      <Transition name="swap" mode="out-in">
        <div :key="active.id" class="stage">
          <!-- 立绘 -->
          <figure class="portrait" :class="{ 'pop-in': appear }">
            <img :src="active.avatar" :alt="`${active.name}的立绘`" loading="eager" />
            <figcaption>{{ active.name }}</figcaption>
          </figure>

          <!-- 信息卡 -->
          <div class="card">
            <p class="role">{{ active.role }}</p>
            <h2 class="name">{{ active.name }}</h2>
            <div class="tags">
              <span v-for="t in active.tags" :key="t" class="tag">{{ t }}</span>
            </div>
            <p class="intro">{{ active.intro }}</p>
            <p class="quote">「{{ active.quote }}」</p>
          </div>
        </div>
      </Transition>

      <!-- 角色切换 -->
      <div class="tabs" role="tablist" aria-label="选择角色">
        <button
          v-for="c in CHARACTERS_DATA"
          :key="c.id"
          type="button"
          class="tab"
          role="tab"
          :aria-selected="c.id === activeId"
          :class="{ on: c.id === activeId }"
          @click="activeId = c.id"
        >
          <img :src="c.avatar" alt="" aria-hidden="true" loading="lazy" />
          <span class="nm">{{ c.name }}</span>
          <span class="rl">{{ c.role }}</span>
        </button>
      </div>

      <p class="tip">点击下面的名片，认识更多人</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.stage {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1.8rem;
  align-items: center;
  padding: 1rem 0 2rem;
}

/* 立绘：相框式卡片（风格指南 §05） */
.portrait {
  margin: 0;
  background: var(--cream);
  border: 3px solid var(--bg2);
  outline: 2px solid var(--rule);
  border-radius: 20px 6px 20px 6px;
  box-shadow: var(--shadow-pop);
  padding: 0.6rem 0.6rem 0.5rem;
  transform: rotate(-1.2deg);
}
.portrait img {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 14px 4px 14px 4px;
}
.portrait figcaption {
  text-align: center;
  font-family: var(--f-title);
  font-size: 0.9rem;
  color: var(--deep);
  margin-top: 0.45rem;
}

/* 信息卡 */
.card {
  background: var(--bg2);
  border: 2px solid var(--rule);
  border-radius: var(--r-card);
  padding: 1.3rem 1.5rem;
}
.role {
  margin: 0 0 0.2rem;
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  color: var(--orange);
  font-weight: 700;
}
.name {
  font-family: var(--f-title);
  font-size: 1.55rem;
  margin: 0 0 0.6rem;
  letter-spacing: 0.1em;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
}
.tag {
  padding: 0.1rem 0.7rem;
  background: var(--yellow);
  border: 1.5px solid var(--rule);
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ink);
}
.intro {
  margin: 0 0 0.9rem;
  font-size: 0.92rem;
  line-height: 1.9;
  color: var(--ink);
}
.quote {
  margin: 0;
  padding-left: 0.9rem;
  border-left: 4px solid var(--green);
  font-size: 0.88rem;
  color: var(--deep);
}

/* 切换名片 */
.tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 0.9rem;
}
.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.5rem 0.4rem 0.6rem;
  background: var(--bg2);
  border: 2px solid var(--rule);
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s var(--ease-pop), border-color 0.2s, box-shadow 0.2s;
}
.tab:hover,
.tab:focus-visible {
  transform: translateY(-4px);
  border-color: var(--orange);
  outline: none;
}
.tab.on {
  border-color: var(--ink);
  box-shadow: var(--shadow-pop);
  background: var(--cream);
}
.tab img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid var(--bg2);
  outline: 1.5px solid var(--rule);
}
.tab .nm {
  font-family: var(--f-title);
  font-size: 0.86rem;
  margin-top: 0.2rem;
}
.tab .rl {
  font-size: 0.68rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.4;
}

.tip {
  text-align: center;
  color: var(--muted);
  font-size: 0.78rem;
  margin: 1.2rem 0 0;
}

/* 立绘自动浮现 */
.portrait.pop-in {
  animation: pop-in 0.7s var(--ease-pop) both;
}
@keyframes pop-in {
  0% { opacity: 0; transform: rotate(-1.2deg) translateY(18px) scale(0.94); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: rotate(-1.2deg) translateY(0) scale(1); }
}

/* 角色切换转场 */
.swap-enter-active { transition: opacity 0.35s var(--ease-pop), transform 0.35s var(--ease-pop); }
.swap-leave-active { transition: opacity 0.2s; }
.swap-enter-from { opacity: 0; transform: translateY(10px) scale(0.97); }
.swap-leave-to { opacity: 0; }

@media (max-width: 760px) {
  .stage {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  .portrait {
    max-width: 300px;
    margin: 0 auto;
    transform: rotate(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .portrait.pop-in { animation-duration: 1ms; }
  .swap-enter-active, .swap-leave-active { transition-duration: 1ms; }
}
</style>
