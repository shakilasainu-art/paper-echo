<script setup lang="ts">
import TextureLayer from './design/texture.vue'
</script>

<template>
  <TextureLayer />
  <router-view v-slot="{ Component }">
    <transition name="page">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
/* 全局基础（对应 tokens --bg / --ink） */
html {
  font-size: 16px;
}
body {
  margin: 0;
  font-family: var(--f-body);
  color: var(--ink);
  background: var(--bg);
  line-height: 1.8;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
button {
  font-family: inherit;
  color: inherit;
}

/* 全局主按钮（风格指南 §06：柠檬黄底 + 手绘描边 + 贴纸硬阴影） */
.btn-primary {
  padding: 0.6rem 1.7rem;
  background: var(--yellow);
  color: var(--ink);
  border: 2.5px solid var(--ink);
  border-radius: var(--r-btn);
  box-shadow: var(--shadow-pop);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.25s var(--ease-pop), box-shadow 0.25s;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px) rotate(-1deg);
  box-shadow: var(--shadow-lift);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 1px 1px 0 var(--rule);
}
.btn-primary:disabled {
  background: var(--locked-fill);
  color: var(--locked-line);
  border-color: var(--locked-line);
  border-style: dashed;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
