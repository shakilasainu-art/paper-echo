<script setup lang="ts">
/**
 * Sparkles —— 光斑氛围层（风格指南 §03「光斑与星光」）
 * 两层景深：depth 1 = 奶油白大光点，depth 2 = 柠檬黄小星
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ count?: number; depth?: 1 | 2 }>(),
  { count: 8, depth: 1 },
)

interface Star {
  x: number
  y: number
  size: number
  dur: number
  delay: number
  opacity: number
}

const stars = computed<Star[]>(() =>
  Array.from({ length: props.count }, () => ({
    x: Math.random() * 96 + 2,
    y: Math.random() * 92 + 4,
    size: (props.depth === 1 ? 9 : 6) + Math.random() * 8,
    dur: 4 + Math.random() * 3,
    delay: -Math.random() * 6,
    opacity: 0.3 + Math.random() * 0.35,
  })),
)
</script>

<template>
  <div class="sparkles" :class="`depth-${depth}`" aria-hidden="true">
    <svg
      v-for="(s, i) in stars"
      :key="i"
      class="star m-float"
      :style="{
        left: s.x + '%',
        top: s.y + '%',
        width: s.size + 'px',
        animationDuration: s.dur + 's',
        animationDelay: s.delay + 's',
        opacity: s.opacity,
      }"
      viewBox="0 0 24 24"
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="currentColor" />
    </svg>
  </div>
</template>

<style scoped>
.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.depth-1 { color: var(--cream); }
.depth-2 { color: var(--yellow); }

.star {
  position: absolute;
  transform: translate(-50%, -50%);
}
</style>
