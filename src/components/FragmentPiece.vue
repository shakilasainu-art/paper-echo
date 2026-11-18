<script setup lang="ts">
/**
 * FragmentPiece —— 记忆碎片三态组件（风格指南 §06）
 * locked: 灰纸 + 虚线 + 60% ｜ available: 奶油白 + 橙描边 + 漂浮 ｜ lit: 金色 + 光晕 + 呼吸
 * celebrate: 从板块返回首页时的回场动画（pop + 星苗迸溅）
 */
import { computed, ref, watch } from 'vue'
import type { ChapterId } from '../config/chapters'
import { SHARD_PATHS } from '../config/shards'
import type { FragState } from '../stores/progress'

const props = withDefaults(
  defineProps<{
    id: ChapterId
    title: string
    state: FragState
    celebrate?: boolean
  }>(),
  { celebrate: false },
)

const emit = defineEmits<{ (e: 'select', id: ChapterId): void }>()

/** 每块碎片用不同轮廓，拼起来才像真的碎冠 */
const shard = computed(() => SHARD_PATHS[(Number(props.id) - 1) % SHARD_PATHS.length])

const shaking = ref(false)
const burstKey = ref(0)
const bursting = ref(false)

watch(
  () => props.celebrate,
  (on) => {
    if (!on) return
    burstKey.value += 1
    bursting.value = true
    window.setTimeout(() => (bursting.value = false), 900)
  },
  { immediate: true },
)

const animClass = computed(() => {
  if (props.celebrate) return 'm-pop'
  if (props.state === 'lit') return 'm-breathe'
  if (props.state === 'available') return 'm-float'
  return ''
})

/** 6 颗星苗的迸溅方向 */
const BURST = [
  { tx: '26px', ty: '-24px' },
  { tx: '-28px', ty: '-18px' },
  { tx: '32px', ty: '8px' },
  { tx: '-24px', ty: '22px' },
  { tx: '6px', ty: '-34px' },
  { tx: '-4px', ty: '30px' },
]

function onClick() {
  if (props.state === 'locked') {
    shaking.value = true
    window.setTimeout(() => (shaking.value = false), 320)
    return
  }
  emit('select', props.id)
}
</script>

<template>
  <button
    type="button"
    class="frag"
    :class="[state, animClass, { 'm-shake': shaking }]"
    :aria-label="`${title}（${state === 'lit' ? '已点亮' : state === 'available' ? '可探索' : '未解锁'}）`"
    @click="onClick"
  >
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path :d="shard" />
    </svg>
    <span class="num" aria-hidden="true">{{ id }}</span>
    <span v-if="state === 'lit'" class="badge" aria-hidden="true">✦</span>

    <!-- 回场星苗 -->
    <span v-if="bursting" :key="burstKey" class="burst" aria-hidden="true">
      <span
        v-for="(b, i) in BURST"
        :key="i"
        class="dot"
        :style="{ '--tx': b.tx, '--ty': b.ty, animationDelay: i * 0.04 + 's' }"
      >✦</span>
    </span>
  </button>
</template>

<style scoped>
.frag {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 100%;
  min-width: 44px; /* 触控目标 ≥ 44px */
  aspect-ratio: 1;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  z-index: var(--z-fragments);
}
.frag:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 4px;
  border-radius: 50%;
}
.frag svg {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.3s var(--ease-pop);
}
.frag:not(.locked):hover svg,
.frag:not(.locked):focus-visible svg {
  transform: translateY(-4px) rotate(-2deg);
}

.locked svg path {
  fill: var(--locked-fill);
  stroke: var(--locked-line);
  stroke-width: 3;
  stroke-dasharray: 7 5;
  stroke-linejoin: round;
}
.locked {
  opacity: 0.55;
  cursor: not-allowed;
}
.available svg path {
  fill: var(--cream);
  stroke: var(--orange);
  stroke-width: 3.5;
  stroke-linejoin: round;
}
.lit svg path {
  fill: var(--yellow);
  stroke: var(--orange);
  stroke-width: 3.5;
  stroke-linejoin: round;
}
.lit svg {
  filter: drop-shadow(0 0 8px rgba(245, 200, 66, 0.85));
}

.num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 4%;
  font-family: var(--f-num);
  font-weight: 700;
  font-size: clamp(0.6rem, 1.1vw, 0.85rem);
  color: var(--deep);
  pointer-events: none;
}
.locked .num {
  color: var(--locked-line);
}

.badge {
  position: absolute;
  top: 2%;
  right: 4%;
  font-size: clamp(0.6rem, 1vw, 0.8rem);
  color: var(--orange);
  pointer-events: none;
}

/* 星苗迸溅 */
.burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dot {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 0.7rem;
  color: var(--yellow);
  text-shadow: 0 0 6px rgba(240, 122, 47, 0.7);
  animation: burst 0.85s ease-out both;
}
@keyframes burst {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
  22% { opacity: 1; }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.7);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dot { animation-duration: 1ms; }
}
</style>
