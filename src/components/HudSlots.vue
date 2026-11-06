<script setup lang="ts">
/**
 * HudSlots —— 7 格碎片进度槽（风格指南 §06）
 * lit = 金色实心 + 外发光；未点亮 = 灰纸虚线
 */
withDefaults(defineProps<{ total?: number; lit: number }>(), { total: 7 })
</script>

<template>
  <div class="hud" role="status" :aria-label="`已点亮 ${lit} / ${total} 块拼图`">
    <span
      v-for="i in total"
      :key="i"
      class="slot"
      :class="{ lit: i <= lit }"
      aria-hidden="true"
    >{{ i <= lit ? '✦' : '?' }}</span>
  </div>
</template>

<style scoped>
.hud {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
.slot {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--locked);
  border-radius: 10px 4px 10px 4px;
  color: var(--locked);
  font-size: 0.8rem;
}
.slot.lit {
  border: 2px solid var(--orange);
  background: var(--yellow);
  color: var(--ink);
  box-shadow: 0 0 8px rgba(245, 200, 66, 0.8);
}
</style>
