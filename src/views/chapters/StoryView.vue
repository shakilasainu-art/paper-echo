<script setup lang="ts">
/**
 * 01 背景故事（技术方案 §05 / M2）
 * 满幅插画（撕纸边缘）+ 文本逐段浮现（IntersectionObserver）+ 摘句卡片
 * 阅读完成度达标后才能点亮碎片（由 ChapterShell 统一控制）
 */
import { useTemplateRef } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import { useReveal } from '../../composables/useReveal'
import { STORY_EPIGRAPH, STORY_PARAGRAPHS, STORY_PULL_NOTE, STORY_PULL_QUOTE } from '../../config/content'

const body = useTemplateRef<HTMLElement>('body')
useReveal(body)
</script>

<template>
  <ChapterShell id="01">
    <div ref="body" class="story">
      <!-- 满幅插画 -->
      <figure class="hero reveal">
        <img
          src="../../assets/img/pe_story_island_2x.webp"
          alt="星云中的悬浮小岛，被一圈发光的紫粉色星环包裹，云朵与星星散落四周，岛上开满小花"
          loading="eager"
        />
        <figcaption>星环岛 · 星光亮起的时刻</figcaption>
      </figure>

      <!-- 题记 -->
      <div class="epigraph reveal">
        <p v-for="(line, i) in STORY_EPIGRAPH" :key="i">{{ line }}</p>
      </div>

      <!-- 正文逐段浮现 -->
      <article class="prose">
        <p v-for="(para, i) in STORY_PARAGRAPHS" :key="i" class="reveal">{{ para }}</p>
      </article>

      <!-- 摘句 -->
      <blockquote class="pull reveal">
        <p class="q">「{{ STORY_PULL_QUOTE }}」</p>
        <p class="n">{{ STORY_PULL_NOTE }}</p>
      </blockquote>

      <p class="tail reveal">—— 翻到这里，第一块碎片已经在等你。</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.story {
  padding-bottom: 0.5rem;
}

/* 满幅插画：突破 ChapterShell 的内容宽度 */
.hero {
  width: 100vw;
  margin: -1.4rem calc(50% - 50vw) 2.2rem;
  padding: 0;
}
.hero img {
  display: block;
  width: 100%;
  height: min(58vh, 520px);
  object-fit: cover;
  object-position: center 42%;
}
.hero figcaption {
  margin-top: 0.55rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.epigraph {
  padding: 0 0 1.6rem;
  border-bottom: 2px dashed var(--rule);
  margin-bottom: 1.8rem;
}
.epigraph p {
  margin: 0;
  font-size: 1rem;
  color: var(--deep);
  line-height: 2;
  letter-spacing: 0.04em;
}
.epigraph p:first-child::before {
  content: '✦ ';
  color: var(--orange);
}

.prose p {
  margin: 0 0 1.5rem;
  font-size: 1.02rem;
  line-height: 2;
  color: var(--ink);
  max-width: 34em;
}
.prose p:first-child::first-letter {
  float: left;
  font-size: 2.6em;
  line-height: 1;
  padding: 0.06em 0.12em 0 0;
  color: var(--orange);
  font-family: var(--f-title);
}

.pull {
  margin: 2.4rem 0;
  padding: 1.4rem 1.6rem;
  background: var(--cream);
  border: 2px solid var(--rule);
  border-radius: 4px 22px 4px 22px;
  box-shadow: var(--shadow-pop);
  text-align: center;
}
.pull .q {
  margin: 0 0 0.4rem;
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.03em;
}
.pull .n {
  margin: 0;
  font-size: 0.8rem;
  color: var(--muted);
}

.tail {
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
  margin: 0 0 0.6rem;
}

/* 逐段浮现 */
.reveal {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.6s var(--ease-pop), transform 0.6s var(--ease-pop);
}
.reveal.in-view {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
@media (max-width: 640px) {
  .prose p {
    font-size: 0.98rem;
  }
  .hero img {
    height: 40vh;
  }
}
</style>
