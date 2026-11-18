<script setup lang="ts">
/**
 * 03 衣服换装（改造版）
 * 交互（参考视频）：鼠标移到衣架上的某件衣服，左右两块面板自动滑出
 *   左 = 服饰立绘，右 = 款式介绍
 * 背景参考图一（衣帽间 / 相框页），卡片参考图二（浅蓝圆角卡 + 编号），
 * 字体参考图三（圆体），文案排版参考视频（大标题 + 两行短句）
 */
import { computed, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'

interface Outfit {
  no: string
  name: string
  line1: string
  line2: string
  img: string
}

const OUTFITS: Outfit[] = [
  {
    no: '01',
    name: '慵懒休闲装',
    line1: '松弛随性，皇冠轻顶。',
    line2: '邀伙伴开启轻松小派对。',
    img: new URL('../../assets/img/pe_outfit_lazy.webp', import.meta.url).href,
  },
  {
    no: '02',
    name: '晚宴管家装',
    line1: '金冠闪耀，托盘斟暖意。',
    line2: '温柔守候每一场晚宴惊喜。',
    img: new URL('../../assets/img/pe_outfit_butler.webp', import.meta.url).href,
  },
  {
    no: '03',
    name: '星光乐手装',
    line1: '星光落满音符披风。',
    line2: '奏响热烈浪漫的派对乐章。',
    img: new URL('../../assets/img/pe_outfit_musician.webp', import.meta.url).href,
  },
  {
    no: '04',
    name: '复古侦探装',
    line1: '手杖藏满奇思脑洞。',
    line2: '在派对搜寻藏好的惊喜。',
    img: new URL('../../assets/img/pe_outfit_detective.webp', import.meta.url).href,
  },
  {
    no: '05',
    name: '复古格纹装',
    line1: '格纹缀上蝴蝶结。',
    line2: '带着元气奔赴甜蜜茶会。',
    img: new URL('../../assets/img/pe_outfit_plaid.webp', import.meta.url).href,
  },
]

/** 当前展示第几套（默认 01，鼠标移上去即切换） */
const active = ref(0)
const current = computed(() => OUTFITS[active.value])

function open(i: number) {
  active.value = i
}
</script>

<template>
  <ChapterShell id="03" :threshold="0.3">
    <div class="wardrobe">
      <!-- 背景：虚化的衣帽间 -->
      <div class="room" aria-hidden="true">
        <span class="rod"></span>
        <span v-for="n in 5" :key="n" class="hanger" :style="{ '--i': n }"></span>
      </div>

      <div class="stage">
        <!-- 左：服饰立绘 -->
        <aside class="panel left">
          <Transition name="swap-l" mode="out-in">
            <div :key="current.no" class="fill">
              <div class="art">
                <img :src="current.img" :alt="`${current.name} 立绘`" />
              </div>
              <span class="badge">{{ current.no }}</span>
            </div>
          </Transition>
        </aside>

        <!-- 右：款式介绍 -->
        <aside class="panel right">
          <Transition name="swap-r" mode="out-in">
            <div :key="current.no" class="fill info">
              <span class="badge">{{ current.no }}</span>
              <h3 class="name">{{ current.name }}</h3>
              <p class="line">{{ current.line1 }}</p>
              <p class="line">{{ current.line2 }}</p>
            </div>
          </Transition>
        </aside>

        <!-- 衣架：五套服饰 -->
        <div class="rail">
          <span class="rail-rod" aria-hidden="true"></span>
          <button
            v-for="(o, i) in OUTFITS"
            :key="o.no"
            type="button"
            class="hang"
            :class="{ on: active === i }"
            :aria-label="`${o.name}：${o.line1}${o.line2}`"
            @mouseenter="open(i)"
            @focus="open(i)"
            @click="open(i)"
          >
            <span class="thumb">
              <span class="num">{{ o.no }}</span>
              <img :src="o.img" :alt="o.name" loading="lazy" />
            </span>
            <span class="tag">{{ o.name }}</span>
          </button>
        </div>
      </div>

      <p class="hint">把鼠标移到衣服上 · 左右会滑出造型与介绍</p>
    </div>
  </ChapterShell>
</template>

<style scoped>
/* ---------- 场景 ---------- */
.wardrobe {
  position: relative;
  width: 100vw;
  box-sizing: border-box;
  margin-left: calc(50% - 50vw);
  min-height: min(80vh, 660px);
  padding: 1.6rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  overflow: hidden;
  border-radius: 0;
  /* 场景专用色：奶油墙面 + 浅蓝服饰卡（参考图一 / 图二） */
  --wall-1: #f6ead6;
  --wall-2: #e8d3b4;
  --wood-1: #b98a5c;
  --wood-2: #8a6240;
  --card-1: #bfe4f7;
  --card-2: #9fd6f2;
  --card-line: #ffffff;
}

.room {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 6%, rgba(255, 246, 224, 0.95) 0%, transparent 52%),
    linear-gradient(180deg, var(--wall-1) 0%, var(--wall-2) 100%);
}
/* 挂衣杆 */
.room .rod {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 17%;
  height: 7px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--wood-1), var(--wood-2));
  box-shadow: 0 6px 10px rgba(94, 66, 40, 0.18);
}
/* 后面挂着的衣服剪影 */
.hanger {
  position: absolute;
  top: 17%;
  left: calc(6% + var(--i) * 18%);
  width: 13%;
  height: 30%;
  background: var(--wood-2);
  opacity: 0.13;
  border-radius: 0 0 40% 40%;
  filter: blur(3px);
  clip-path: polygon(46% 0, 54% 0, 54% 14%, 100% 44%, 92% 100%, 8% 100%, 0 44%, 46% 14%);
}
.room::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 45%, transparent 32%, rgba(120, 90, 56, 0.22) 100%);
}

/* ---------- 舞台 ---------- */
.stage {
  position: relative;
  z-index: 2;
  width: min(96vw, 1020px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

/* ---------- 左右滑出面板 ---------- */
.panel {
  position: relative;
  min-height: clamp(196px, 30vh, 290px);
  border-radius: 22px;
  border: 4px solid var(--ink);
  box-shadow: 6px 8px 0 rgba(70, 48, 30, 0.22);
  overflow: hidden;
  will-change: transform;
}
.panel.left {
  background: #fffbf0;
  animation: slide-in-left 0.72s cubic-bezier(0.22, 0.9, 0.24, 1) both;
}
.panel.right {
  background: linear-gradient(160deg, var(--card-1) 0%, var(--card-2) 100%);
  animation: slide-in-right 0.72s cubic-bezier(0.22, 0.9, 0.24, 1) 0.06s both;
}
@keyframes slide-in-left {
  from {
    transform: translateX(-118%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-in-right {
  from {
    transform: translateX(118%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fill {
  position: absolute;
  inset: 0;
}

/* 切换服饰时，内容从各自一侧滑入 */
.swap-l-enter-from,
.swap-l-leave-to {
  opacity: 0;
  transform: translateX(-14%);
}
.swap-l-enter-active,
.swap-l-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.34s cubic-bezier(0.22, 0.9, 0.24, 1);
}
.swap-r-enter-from,
.swap-r-leave-to {
  opacity: 0;
  transform: translateX(14%);
}
.swap-r-enter-active,
.swap-r-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.34s cubic-bezier(0.22, 0.9, 0.24, 1);
}

/* 左面板：立绘 */
.art {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.art img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 原图四边留白较多，放大后裁掉多余白边 */
  transform: scale(1.2);
  /* 素材为白底，正片叠底后融进纸面 */
  mix-blend-mode: multiply;
}

/* 右面板：介绍（排版参考视频：大标题 + 短句） */
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.2rem 1.4rem;
  box-sizing: border-box;
}
.name {
  margin: 0 0 0.6rem;
  font-family: var(--f-title);
  font-size: clamp(1.15rem, 2.4vw, 1.75rem);
  letter-spacing: 0.08em;
  color: #1f3b4a;
  text-shadow: 0 2px 0 rgba(255, 255, 255, 0.55);
}
.line {
  margin: 0 0 0.28rem;
  font-family: var(--f-title);
  font-size: clamp(0.8rem, 1.35vw, 1rem);
  line-height: 1.85;
  color: #24404f;
}

/* 编号：参考图二左上角数字 */
.badge {
  position: absolute;
  left: 0.95rem;
  top: 0.8rem;
  font-family: var(--f-num);
  font-weight: 700;
  font-size: clamp(1rem, 1.9vw, 1.4rem);
  letter-spacing: 0.04em;
  color: #3f8fb8;
  opacity: 0.9;
}
.panel.left .badge {
  color: var(--wood-2);
}

/* ---------- 衣架 ---------- */
.rail {
  grid-column: 1 / -1;
  position: relative;
  display: flex;
  justify-content: center;
  gap: clamp(0.4rem, 1.2vw, 1rem);
  padding-top: 0.5rem;
}
.rail-rod {
  position: absolute;
  left: 2%;
  right: 2%;
  top: 0;
  height: 5px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--wood-1), var(--wood-2));
}
.hang {
  position: relative;
  flex: 0 1 128px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.14rem;
  transition: transform 0.28s var(--ease-pop);
}
/* 衣架钩子 */
.hang::before {
  content: '';
  width: 10px;
  height: 12px;
  border: 3px solid var(--wood-2);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  margin-bottom: -1px;
}
.hang:hover,
.hang.on {
  transform: translateY(-6px);
}

.thumb {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  border: 3px solid var(--ink);
  background: linear-gradient(165deg, var(--card-1) 0%, var(--card-2) 100%);
  box-shadow: 3px 4px 0 rgba(70, 48, 30, 0.2);
  overflow: hidden;
  transition: box-shadow 0.28s, transform 0.28s;
}
.thumb img {
  position: absolute;
  inset: 6%;
  width: 88%;
  height: 88%;
  object-fit: contain;
  mix-blend-mode: multiply;
}
.num {
  position: absolute;
  left: 0.4rem;
  top: 0.12rem;
  z-index: 2;
  font-family: var(--f-num);
  font-weight: 700;
  font-size: clamp(0.55rem, 0.85vw, 0.68rem);
  color: #3f8fb8;
  letter-spacing: 0.04em;
}
.hang.on .thumb,
.hang:hover .thumb {
  box-shadow: 3px 6px 0 rgba(70, 48, 30, 0.28), 0 0 0 4px rgba(255, 255, 255, 0.7);
}

.tag {
  display: block;
  width: 100%;
  padding: 0.12rem 0 0.18rem;
  border-radius: 8px;
  background: #fffdf4;
  border: 2px solid var(--ink);
  font-family: var(--f-title);
  font-size: clamp(0.58rem, 0.95vw, 0.72rem);
  line-height: 1.5;
  color: var(--ink);
  text-align: center;
  white-space: nowrap;
}

.hint {
  position: relative;
  z-index: 2;
  margin: 0;
  font-size: 0.8rem;
  color: var(--deep);
  background: #fffdf4;
  border: 2px solid var(--rule);
  border-radius: 999px;
  padding: 0.28rem 1.05rem;
  box-shadow: var(--shadow-pop);
}

/* ---------- 移动端：保持左右滑出，只压缩尺寸 ---------- */
@media (max-width: 760px) {
  .wardrobe {
    min-height: 76vh;
    padding: 1.1rem 0.5rem 1.5rem;
  }
  .stage {
    gap: 0.5rem;
  }
  .panel {
    min-height: clamp(140px, 24vh, 180px);
    border-width: 3px;
    border-radius: 16px;
  }
  .panel.right {
    padding: 0.7rem 0.75rem;
  }
  .name {
    margin-bottom: 0.22rem;
    font-size: 0.86rem;
    letter-spacing: 0.04em;
  }
  .line {
    font-size: 0.6rem;
    line-height: 1.7;
    margin-bottom: 0.1rem;
  }
  .badge {
    left: 0.55rem;
    top: 0.4rem;
    font-size: 0.72rem;
  }
  .rail {
    gap: 0.28rem;
    padding-top: 0.35rem;
  }
  .hang {
    flex: 1 1 0;
  }
  .thumb {
    border-width: 2px;
    border-radius: 12px;
  }
  .tag {
    font-size: 0.5rem;
    letter-spacing: 0;
    padding: 0.06rem 0;
    border-width: 1.5px;
    border-radius: 6px;
  }
  .hint {
    font-size: 0.7rem;
    padding: 0.24rem 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .hang,
  .thumb {
    transition-duration: 1ms;
  }
}
</style>
