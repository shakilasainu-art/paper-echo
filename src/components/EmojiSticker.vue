<script setup lang="ts">
/**
 * EmojiSticker —— 手绘表情贴纸（04 表情收藏）
 * 8 种表情，全部 SVG 勾线；底色由 --tone 控制
 */
import { computed } from 'vue'
import type { EmojiExpression } from '../config/content'

const props = defineProps<{ expression: EmojiExpression; tone: string }>()

const toneVar = computed(() => `var(--${props.tone})`)

const LABEL: Record<EmojiExpression, string> = {
  curious: '好奇',
  hungry: '贪吃',
  sideeye: '斜眼',
  shy: '害羞',
  joy: '开心',
  stuffed: '吃撑',
  angry: '炸毛',
  sleepy: '打盹',
}
</script>

<template>
  <div class="sticker" :style="{ '--tone': toneVar }">
    <svg viewBox="0 0 120 120" role="img" :aria-label="LABEL[expression]">
      <circle cx="60" cy="60" r="56" fill="var(--bg2)" />
      <circle cx="60" cy="60" r="50" fill="var(--tone)" opacity="0.5" />
      <circle cx="60" cy="60" r="40" fill="var(--cream)" stroke="var(--ink)" stroke-width="2.5" />

      <!-- 腮红 -->
      <g fill="var(--pink)" :opacity="expression === 'shy' ? 0.95 : 0.7">
        <ellipse cx="38" cy="72" :rx="expression === 'shy' ? 10 : 8" ry="4.6" />
        <ellipse cx="82" cy="72" :rx="expression === 'shy' ? 10 : 8" ry="4.6" />
      </g>

      <!-- 好奇 -->
      <g v-if="expression === 'curious'">
        <path d="M38 48 q7 -6 14 0 M68 48 q7 -6 14 0" class="brow" />
        <circle cx="47" cy="60" r="7.5" fill="var(--ink)" />
        <circle cx="73" cy="60" r="7.5" fill="var(--ink)" />
        <circle cx="49" cy="57" r="2.4" fill="var(--bg2)" />
        <circle cx="75" cy="57" r="2.4" fill="var(--bg2)" />
        <ellipse cx="60" cy="80" rx="4.5" ry="5.5" fill="var(--ink)" />
      </g>

      <!-- 贪吃 -->
      <g v-else-if="expression === 'hungry'">
        <circle cx="46" cy="58" r="5.5" fill="var(--ink)" />
        <circle cx="74" cy="58" r="5.5" fill="var(--ink)" />
        <circle cx="47.5" cy="56" r="1.8" fill="var(--bg2)" />
        <circle cx="75.5" cy="56" r="1.8" fill="var(--bg2)" />
        <ellipse cx="60" cy="78" rx="9" ry="8" fill="var(--ink)" />
        <ellipse cx="60" cy="82" rx="5" ry="3.5" fill="var(--pink)" />
        <path d="M69 86 q4 8 1 12 q-4 -2 -3 -8" fill="var(--sky)" opacity="0.8" />
      </g>

      <!-- 斜眼 -->
      <g v-else-if="expression === 'sideeye'">
        <path d="M38 56 q8 -6 16 0 q-8 6 -16 0 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="2" />
        <path d="M66 56 q8 -6 16 0 q-8 6 -16 0 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="2" />
        <circle cx="49" cy="57" r="3.5" fill="var(--ink)" />
        <circle cx="77" cy="57" r="3.5" fill="var(--ink)" />
        <path d="M50 78 q10 2 20 0" class="mouth" />
        <path d="M42 46 q8 -4 14 1" class="brow" :opacity="0.5" />
      </g>

      <!-- 害羞 -->
      <g v-else-if="expression === 'shy'">
        <path d="M40 60 q7 7 14 0 M66 60 q7 7 14 0" class="mouth" />
        <path d="M50 78 q5 -5 10 0 q5 -5 10 0" class="mouth" />
        <path d="M32 80 l6 4 M88 80 l-6 4" stroke="var(--pink)" stroke-width="2.5" />
      </g>

      <!-- 开心 -->
      <g v-else-if="expression === 'joy'">
        <path d="M40 62 q7 -9 14 0 M66 62 q7 -9 14 0" class="mouth" stroke-width="3.5" />
        <path d="M48 76 Q60 94 72 76 Q60 82 48 76 Z" fill="var(--pink)" class="mouth" />
        <path d="M86 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="var(--yellow)" />
      </g>

      <!-- 吃撑 -->
      <g v-else-if="expression === 'stuffed'">
        <path d="M40 59 q7 5 14 0 M66 59 q7 5 14 0" class="mouth" />
        <ellipse cx="60" cy="78" rx="5" ry="3.5" fill="var(--ink)" />
        <circle cx="34" cy="66" r="1.6" fill="var(--orange)" />
        <circle cx="86" cy="64" r="1.4" fill="var(--orange)" />
        <circle cx="84" cy="76" r="1.2" fill="var(--orange)" />
      </g>

      <!-- 炸毛 -->
      <g v-else-if="expression === 'angry'">
        <path d="M38 46 L54 54 M82 46 L66 54" class="mouth" stroke-width="3" />
        <circle cx="47" cy="62" r="4" fill="var(--ink)" />
        <circle cx="73" cy="62" r="4" fill="var(--ink)" />
        <path d="M50 82 l5 -4 l5 4 l5 -4 l5 4" class="mouth" />
        <path d="M88 38 l8 -6 M92 44 l8 -2" stroke="var(--orange)" stroke-width="2.5" />
      </g>

      <!-- 打盹 -->
      <g v-else>
        <path d="M40 60 q7 4 14 0 M66 60 q7 4 14 0" class="mouth" />
        <path d="M38 56 l-4 -4 M42 58 l-4 -2 M82 58 l4 -2 M86 56 l4 -4" stroke="var(--ink)" stroke-width="1.5" opacity="0.6" />
        <ellipse cx="60" cy="79" rx="4" ry="3" fill="var(--ink)" />
        <text x="88" y="36" font-size="12" fill="var(--ink)" opacity="0.7">z</text>
        <text x="96" y="26" font-size="9" fill="var(--ink)" opacity="0.5">z</text>
      </g>

      <!-- 贴纸角标 -->
      <path d="M98 22 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="var(--bg2)" opacity="0.9" />
    </svg>
  </div>
</template>

<style scoped>
.sticker {
  display: block;
  width: 100%;
  aspect-ratio: 1;
}
svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(3px 3px 0 var(--rule));
}
.brow {
  stroke: var(--ink);
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
}
.mouth {
  stroke: var(--ink);
  stroke-width: 2.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
text {
  font-family: var(--f-num);
}
</style>
