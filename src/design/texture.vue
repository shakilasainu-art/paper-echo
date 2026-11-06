<script setup lang="ts">
/**
 * 全站质感层（风格指南 §03）：
 * 1. 纸纹噪点 fixed 覆盖层（feTurbulence，透明度 5%）
 * 2. 蜡笔粗糙滤镜 #crayon（供任意元素 filter: url(#crayon)）
 */
</script>

<template>
  <!-- 蜡笔位移滤镜定义 -->
  <svg width="0" height="0" style="position: absolute" aria-hidden="true">
    <defs>
      <filter id="crayon">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
      </filter>
    </defs>
  </svg>

  <!-- 纸纹噪点：全站统一叠加，不参与任何交互 -->
  <svg class="grain-layer" aria-hidden="true">
    <filter id="paper-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paper-grain)" />
  </svg>
</template>

<style scoped>
.grain-layer {
  position: fixed;
  inset: 0;
  z-index: 999;
  pointer-events: none;
  opacity: 0.05;
}
@media print {
  .grain-layer { display: none; }
}
</style>
