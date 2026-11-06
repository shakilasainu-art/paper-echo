<script setup lang="ts">
/**
 * OutfitArt —— 手绘服饰小图（03 衣服换装）
 * 纯 SVG 蜡笔勾线，主色/辅色由外层 --oc1 / --oc2 控制，不新增硬编码颜色
 */
import type { OutfitKind } from '../config/content'

defineProps<{ kind: OutfitKind }>()
</script>

<template>
  <svg class="art" viewBox="0 0 200 260" role="img" aria-hidden="true">
    <!-- 衣架 -->
    <g class="hanger">
      <path d="M100 6 v12" />
      <path d="M100 18 L66 44 Q100 56 134 44 L100 18 Z" />
    </g>

    <!-- 01 背带裙 -->
    <g v-if="kind === 'pinafore'">
      <path d="M78 54 L64 104 M122 54 L136 104" class="line" />
      <path d="M64 104 L46 236 Q100 250 154 236 L136 104 Z" fill="var(--oc1)" class="edge" />
      <path d="M78 104 H122 V148 H78 Z" fill="var(--oc2)" class="edge" />
      <path d="M84 180 H116 V212 H84 Z" fill="var(--cream)" class="edge" />
      <path d="M50 230 Q100 242 150 230" stroke="var(--oc2)" stroke-width="7" fill="none" />
      <path d="M100 102 l-13 -9 v18 z" fill="var(--orange)" class="edge thin" />
      <path d="M100 102 l13 -9 v18 z" fill="var(--orange)" class="edge thin" />
      <circle cx="100" cy="102" r="4" fill="var(--ink)" />
      <!-- 洗不掉的绿颜料 -->
      <path d="M128 214 q9 -7 16 2 q-9 7 -16 -2" fill="var(--green)" opacity="0.55" />
    </g>

    <!-- 02 雨衣 -->
    <g v-else-if="kind === 'raincoat'">
      <path d="M82 112 L52 198 L72 206 L94 140 Z" fill="var(--oc1)" class="edge" />
      <path d="M118 112 L148 198 L128 206 L106 140 Z" fill="var(--oc1)" class="edge" />
      <path d="M78 94 Q72 48 100 46 Q128 48 122 94 Q100 110 78 94 Z" fill="var(--oc1)" class="edge" />
      <path d="M78 94 L58 236 Q100 248 142 236 L122 94 Z" fill="var(--oc1)" class="edge" />
      <path d="M100 94 V240" class="line" stroke-width="2" />
      <path d="M82 86 Q100 102 118 86" stroke="var(--oc2)" stroke-width="4" fill="none" />
      <path d="M64 176 Q100 190 136 176 V192 Q100 206 64 192 Z" fill="var(--oc2)" class="edge thin" />
      <circle cx="100" cy="128" r="4.5" fill="var(--oc2)" class="edge thin" />
      <circle cx="100" cy="152" r="4.5" fill="var(--oc2)" class="edge thin" />
      <path d="M84 208 q6 8 12 0" stroke="var(--ink)" stroke-width="2" fill="none" opacity="0.5" />
    </g>

    <!-- 03 睡裙 -->
    <g v-else-if="kind === 'nightgown'">
      <circle cx="66" cy="112" r="17" fill="var(--oc1)" class="edge" />
      <circle cx="134" cy="112" r="17" fill="var(--oc1)" class="edge" />
      <path d="M76 92 Q100 110 124 92 L140 238 Q100 252 60 238 Z" fill="var(--oc1)" class="edge" />
      <path d="M76 92 Q100 118 124 92" class="line" />
      <g fill="var(--oc2)">
        <circle cx="70" cy="241" r="5" />
        <circle cx="84" cy="244" r="5" />
        <circle cx="98" cy="246" r="5" />
        <circle cx="112" cy="245" r="5" />
        <circle cx="126" cy="242" r="5" />
      </g>
      <!-- 小月亮 -->
      <circle cx="114" cy="158" r="13" fill="var(--yellow)" class="edge thin" />
      <circle cx="120" cy="153" r="12" fill="var(--oc1)" />
      <path d="M84 176 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="var(--oc2)" />
      <path d="M88 206 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="var(--oc2)" opacity="0.8" />
    </g>

    <!-- 04 水手服 -->
    <g v-else-if="kind === 'sailor'">
      <path d="M62 172 L56 230 L96 230 L100 196 L104 230 L144 230 L138 172 Q100 184 62 172 Z" fill="var(--deep)" class="edge" />
      <path d="M64 100 L44 150 L62 158 L80 118 Z" fill="var(--oc1)" class="edge" />
      <path d="M136 100 L156 150 L138 158 L120 118 Z" fill="var(--oc1)" class="edge" />
      <path d="M64 96 L56 178 Q100 192 144 178 L136 96 Z" fill="var(--oc1)" class="edge" />
      <path d="M74 96 L100 136 L126 96 L116 84 L100 112 L84 84 Z" fill="var(--oc2)" class="edge" />
      <path d="M100 130 l-9 14 9 12 9 -12 z" fill="var(--orange)" class="edge thin" />
      <circle cx="100" cy="166" r="3.5" fill="var(--ink)" opacity="0.7" />
      <path d="M114 76 q8 10 4 18" stroke="var(--oc2)" stroke-width="4" fill="none" />
    </g>

    <!-- 05 星夜披风 -->
    <g v-else>
      <path d="M100 52 Q152 62 166 120 L158 240 Q100 252 42 240 L34 120 Q48 62 100 52 Z" fill="var(--oc1)" class="edge" />
      <path d="M100 62 Q132 108 134 236 Q100 244 66 236 Q68 108 100 62 Z" fill="var(--oc2)" />
      <circle cx="100" cy="96" r="8" fill="var(--orange)" class="edge thin" />
      <path d="M80 152 L84 136 L92 146 L100 132 L108 146 L116 136 L120 152 Q100 162 80 152 Z" fill="var(--yellow)" class="edge thin" />
      <path d="M74 196 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5 z" fill="var(--yellow)" opacity="0.9" />
      <path d="M126 212 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="var(--yellow)" opacity="0.8" />
    </g>
  </svg>
</template>

<style scoped>
.art {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.hanger path {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.75;
}
.edge {
  stroke: var(--ink);
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.edge.thin {
  stroke-width: 2.5;
}
.line {
  stroke: var(--ink);
  stroke-width: 3;
}
</style>
