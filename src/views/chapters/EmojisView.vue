<script setup lang="ts">
/**
 * 04 表情收藏（技术方案 §05 / M3）
 * 贴纸墙：hover / focus 放大并弹出触发语气泡；触屏点按固定气泡；空位显示收集框
 */
import { ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'
import EmojiSticker from '../../components/EmojiSticker.vue'
import { STICKERS_DATA, STICKER_EMPTY_SLOTS } from '../../config/content'

const pinnedId = ref<string | null>(null)

function toggle(id: string) {
  pinnedId.value = pinnedId.value === id ? null : id
}
</script>

<template>
  <ChapterShell id="04" :threshold="0.55">
    <div class="emojis">
      <header class="lede m-rise">
        <p class="kicker">STICKER ALBUM · 贴纸簿</p>
        <p class="txt">
          元元把一路上的表情都收进了这本贴纸簿。有些是笑出来的，有些是被风吹出来的。把鼠标停在一张贴纸上，它会说一句当时的话；触屏就点一下。
        </p>
      </header>

      <div class="wall">
        <button
          v-for="(s, i) in STICKERS_DATA"
          :key="s.id"
          type="button"
          class="cell"
          :class="{ pinned: pinnedId === s.id }"
          :aria-pressed="pinnedId === s.id"
          :aria-label="`${s.owner}的${s.name}贴纸：${s.trigger}`"
          @click="toggle(s.id)"
        >
          <span class="bubble" aria-hidden="true">{{ s.trigger }}</span>
          <span class="sticker-wrap" :style="{ transform: `rotate(${i % 2 ? 2 : -2}deg)` }">
            <EmojiSticker :expression="s.expression" :tone="s.tone" />
          </span>
          <span class="meta">
            <b>{{ s.name }}</b>
            <i>{{ s.owner }}</i>
          </span>
        </button>

        <!-- 空收集位 -->
        <div v-for="n in STICKER_EMPTY_SLOTS" :key="`empty-${n}`" class="cell empty" aria-hidden="true">
          <span class="lock">🔒</span>
          <span class="empty-txt">待收集</span>
          <span class="empty-no">No.{{ 8 + n }}</span>
        </div>
      </div>

      <div class="counter">
        <span class="pips" aria-hidden="true">
          <i v-for="n in 12" :key="n" :class="{ on: n <= STICKERS_DATA.length }"></i>
        </span>
        <span class="num">{{ STICKERS_DATA.length }} / 12 已收藏</span>
      </div>

      <p class="tip">悬停放大 · 点按固定气泡 · 再点一次收起</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
.lede {
  padding: 0 0 1.4rem;
}
.kicker {
  margin: 0 0 0.3rem;
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  color: var(--orange);
  font-weight: 700;
}
.txt {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.95;
  color: var(--ink);
  max-width: 36em;
}

/* 手帐网格 */
.wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 1.3rem 0.9rem;
  padding: 1.4rem 1.1rem 1.6rem;
  background:
    repeating-linear-gradient(180deg, transparent 0 25px, var(--rule) 25px 26px),
    var(--bg2);
  border: 2.5px solid var(--rule);
  border-radius: 4px 24px 4px 24px;
  box-shadow: var(--shadow-pop);
}

.cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.2rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}
.cell:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 4px;
  border-radius: 18px;
}
.cell:hover,
.cell:focus-visible,
.cell.pinned {
  z-index: 5;
}

.sticker-wrap {
  display: block;
  width: 100%;
  transition: transform 0.35s var(--ease-pop);
}
.cell:hover .sticker-wrap,
.cell:focus-visible .sticker-wrap,
.cell.pinned .sticker-wrap {
  transform: scale(1.15) rotate(-2deg) !important;
}

.meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.35;
}
.meta b {
  font-size: 0.78rem;
}
.meta i {
  font-style: normal;
  font-size: 0.66rem;
  color: var(--muted);
}

/* 气泡 */
.bubble {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 0.2rem);
  width: max-content;
  max-width: 184px;
  padding: 0.55rem 0.7rem;
  background: var(--cream);
  border: 2px solid var(--ink);
  border-radius: 12px 12px 12px 3px;
  box-shadow: var(--shadow-pop);
  font-size: 0.72rem;
  line-height: 1.65;
  color: var(--ink);
  text-align: left;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 8px) scale(0.94);
  transform-origin: 50% 100%;
  transition: opacity 0.25s ease, transform 0.35s var(--ease-pop);
}
.bubble::after {
  content: '';
  position: absolute;
  left: 16px;
  bottom: -9px;
  width: 14px;
  height: 9px;
  background: var(--cream);
  border-right: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  transform: skewX(-24deg);
}
.cell:hover .bubble,
.cell:focus-visible .bubble,
.cell.pinned .bubble {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

/* 空位 */
.cell.empty {
  aspect-ratio: 1;
  justify-content: center;
  border: 2px dashed var(--locked-line);
  border-radius: 14px;
  background: var(--locked-fill);
  opacity: 0.6;
  cursor: default;
}
.lock {
  font-size: 1.1rem;
  filter: grayscale(1);
}
.empty-txt {
  font-size: 0.68rem;
  color: var(--locked-line);
}
.empty-no {
  font-family: var(--f-num);
  font-size: 0.6rem;
  color: var(--locked-line);
  letter-spacing: 0.12em;
}

/* 计数 */
.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1.1rem;
}
.pips {
  display: flex;
  gap: 0.22rem;
}
.pips i {
  width: 9px;
  height: 9px;
  border: 1.5px dashed var(--locked);
  border-radius: 3px 1px 3px 1px;
}
.pips i.on {
  background: var(--yellow);
  border: 1.5px solid var(--orange);
}
.num {
  font-size: 0.74rem;
  color: var(--muted);
}
.tip {
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
  margin: 0.8rem 0 0.4rem;
}

@media (max-width: 560px) {
  .wall {
    grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
    gap: 1.4rem 0.6rem;
    padding: 1.2rem 0.7rem 1.3rem;
  }
  .bubble {
    max-width: 150px;
    font-size: 0.68rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sticker-wrap,
  .bubble {
    transition-duration: 1ms;
  }
}
</style>
