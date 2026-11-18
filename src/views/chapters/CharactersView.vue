<script setup lang="ts">
/**
 * 02 角色介绍（改造版）
 * 场景：虚化书架 + 台前一册合起的书；点击书本翻开
 *   左页 = 角色展示（封面内侧）
 *   右页 = 基础档案（标题与排版参考图二）
 * 书本闭合时整体右移半页宽，使合起的书居中；翻开时用 transform 完成位移与翻页
 */
import { computed, ref } from 'vue'
import ChapterShell from '../../components/ChapterShell.vue'

const open = ref(false)
const yuanyuan = new URL('../../assets/img/pe_char_yuanyuan_dog.webp', import.meta.url).href

const PROFILE = {
  name: '元元',
  job: '专属派对向导',
  species: '星环小狗',
  mbti: 'ENEP',
  zodiac: '巨蟹座',
  traits:
    '开朗、元气、热心、会照顾人、社恐友好、脑洞大、喜欢惊喜、温暖陪伴、松弛不油腻，自带阳光气场，能够带动沉默的氛围，把沉默变成话题，把话题变成游戏。',
  catchphrase: '「来凑一局，一起玩吧，先玩起来再说。」「哇塞！好厉害！」「太棒了！我的天！」',
}

/* ---------- 背景书架（确定性伪随机，避免每次渲染跳动） ---------- */
const SPINE_COLORS = [
  '#8C3B2E',
  '#A9552F',
  '#C08A3E',
  '#D9B45B',
  '#7A8B4A',
  '#4F6B57',
  '#3F5D6B',
  '#6B4A32',
  '#B4574A',
  '#E3D3B0',
  '#8E6A48',
  '#5C7A6B',
]

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

const shelves = computed(() =>
  Array.from({ length: 4 }, (_, r) => {
    const rand = seeded(r * 97 + 13)
    return Array.from({ length: 26 }, () => ({
      w: 9 + rand() * 17,
      h: 52 + rand() * 44,
      c: SPINE_COLORS[Math.floor(rand() * SPINE_COLORS.length)],
      band: rand() > 0.6,
    }))
  }),
)

function toggle() {
  open.value = !open.value
}
</script>

<template>
  <ChapterShell id="02" :threshold="0.25">
    <div class="chars">
      <!-- 背景：虚化书架 -->
      <div class="shelf" aria-hidden="true">
        <div v-for="(row, r) in shelves" :key="r" class="row">
          <span
            v-for="(b, i) in row"
            :key="i"
            class="spine"
            :style="{ width: b.w + 'px', height: b.h + '%', background: b.c }"
          >
            <i v-if="b.band" class="band"></i>
          </span>
        </div>
      </div>

      <div class="stage">
        <div
          class="book"
          :class="{ open }"
          role="button"
          tabindex="0"
          :aria-expanded="open"
          :aria-label="open ? '合上角色档案' : '翻开角色档案'"
          @click="toggle"
          @keydown.enter.prevent="toggle"
          @keydown.space.prevent="toggle"
        >
          <!-- 内页：左页被封面内侧盖住，只显示右页档案 -->
          <div class="spread">
            <div class="page left" aria-hidden="true"></div>
            <div class="page right">
              <div class="info">
                <h2 class="h">基础档案</h2>
                <p class="line"><b>名字：</b>{{ PROFILE.name }}</p>
                <p class="line"><b>职能：</b>{{ PROFILE.job }}</p>
                <p class="line"><b>物种：</b>{{ PROFILE.species }}</p>
                <p class="line"><b>MBTI：</b>{{ PROFILE.mbti }}</p>
                <p class="line"><b>星座：</b>{{ PROFILE.zodiac }}</p>
                <p class="line"><b>性格：</b>{{ PROFILE.traits }}</p>
                <p class="line"><b>口头禅：</b>{{ PROFILE.catchphrase }}</p>
                <span class="stamp" aria-hidden="true">
                  派对向导票
                  <em>PARTY GUIDE</em>
                </span>
              </div>
            </div>
          </div>

          <!-- 书页厚度（合起时从封面下方探出） -->
          <span class="block" aria-hidden="true"></span>

          <!-- 封面：正面是书封，背面是角色展示 -->
          <div class="cover">
            <div class="face front">
              <span class="plate">
                <span class="ct">角色档案</span>
                <span class="cs">CHARACTER FILE</span>
              </span>
              <span class="mark" aria-hidden="true">
                <i class="eye"></i>
                <i class="eye"></i>
                <i class="blush"></i>
                <i class="blush"></i>
                <i class="smile"></i>
              </span>
              <span class="ribbon" aria-hidden="true"></span>
            </div>

            <div class="face back">
              <img :src="yuanyuan" alt="元元：白色星环小狗，蓝色耳朵，头戴小皇冠" />
              <span class="back-name">元元</span>
            </div>
          </div>
        </div>

        <p class="hint">{{ open ? '再点一次，把书合上' : '点击书本，翻开元元的基础档案' }}</p>
      </div>
    </div>
  </ChapterShell>
</template>

<style scoped>
/* ---------- 场景 ---------- */
.chars {
  position: relative;
  width: 100vw;
  box-sizing: border-box;
  margin-left: calc(50% - 50vw);
  min-height: min(80vh, 700px);
  padding: 1.8rem 1rem 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0;
  /* 场景专用暖木色（参考图一），仅本板块使用 */
  --wood-0: #3e2a1c;
  --wood-1: #6b4a31;
  --wood-2: #8a6240;
  --wood-3: #a97c4f;
  --wood-edge: #2e1f15;
}

.shelf {
  position: absolute;
  inset: -5%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 1% 0;
  background:
    radial-gradient(ellipse at 50% 4%, rgba(255, 214, 140, 0.4) 0%, transparent 46%),
    linear-gradient(180deg, var(--wood-1) 0%, var(--wood-0) 100%);
  filter: blur(2.4px);
}
.row {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 21%;
  padding: 0 1%;
  border-bottom: 9px solid var(--wood-3);
  box-shadow: 0 4px 0 var(--wood-edge), 0 10px 12px rgba(24, 14, 8, 0.45);
}
.spine {
  position: relative;
  /* 按基准宽度比例铺满整排，宽屏也不会留空 */
  flex: 1 1 auto;
  min-width: 5px;
  border-radius: 2px 2px 0 0;
  box-shadow: inset -2px 0 0 rgba(24, 14, 8, 0.3), inset 2px 0 0 rgba(255, 253, 244, 0.22);
}
.band {
  position: absolute;
  left: 0;
  right: 0;
  top: 38%;
  height: 4px;
  background: rgba(255, 248, 231, 0.8);
  opacity: 0.75;
}

/* 暗角：把书架压深，托出前景的书 */
.chars::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 42%, transparent 26%, rgba(30, 18, 10, 0.5) 100%);
}

/* 上下压一层纸色渐变，让场景融回页面 */
.chars::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    var(--bg) 0%,
    rgba(251, 246, 234, 0.28) 10%,
    rgba(251, 246, 234, 0) 30%,
    rgba(251, 246, 234, 0) 70%,
    rgba(251, 246, 234, 0.3) 90%,
    var(--bg) 100%
  );
}

/* ---------- 书本 ---------- */
.stage {
  position: relative;
  z-index: 2;
  width: min(96vw, 1000px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
}

.book {
  position: relative;
  width: 100%;
  aspect-ratio: 2.2 / 1;
  /* 合起时右移半页，让单页书本居中 */
  transform: translateX(-25%);
  transition: transform 0.7s var(--ease-pop);
  perspective: 2000px;
  cursor: pointer;
  outline: none;
}
.book.open {
  transform: translateX(0);
}
.book:focus-visible {
  outline: 3px dashed var(--orange);
  outline-offset: 10px;
  border-radius: 12px;
}

.spread {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fffbf0;
  border: 3px solid var(--ink);
  border-radius: 8px;
  box-shadow: 8px 10px 0 rgba(30, 18, 10, 0.18);
  opacity: 0;
  transition: opacity 0.35s ease 0.18s;
  overflow: hidden;
}
.open .spread {
  opacity: 1;
}
.page.left {
  background: #fffbf0;
}

.page.right {
  background: linear-gradient(90deg, rgba(120, 96, 64, 0.1), transparent 14%), #fffbf0;
  border-left: 1px solid #e6dfc8;
}

/* 书页厚度：一叠纸边 */
.block {
  position: absolute;
  top: 10px;
  bottom: -14px;
  left: calc(50% + 12px);
  right: -12px;
  z-index: 1;
  border: 4px solid var(--ink);
  border-radius: 4px 12px 12px 4px;
  background: repeating-linear-gradient(90deg, #fffdf4 0 3px, #e6dfc8 3px 4px);
  box-shadow: 0 4px 0 rgba(30, 18, 10, 0.16);
}

/* ---------- 封面 ---------- */
.cover {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 50%;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform 0.95s cubic-bezier(0.35, 0.02, 0.2, 1);
  z-index: 3;
}
.open .cover {
  transform: rotateY(-180deg);
}

.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 14px;
}

/* 书封正面：薄荷绿布面 + 墨线描边（参考图二） */
.front {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 8% 10%;
  box-sizing: border-box;
  background: linear-gradient(160deg, #b7dccd 0%, #8fc4b4 100%);
  border: 5px solid var(--ink);
  border-radius: 18px;
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.6),
    inset 0 -10px 0 rgba(51, 64, 42, 0.08),
    6px 8px 0 rgba(30, 18, 10, 0.2);
  color: var(--ink);
  overflow: hidden;
}

/* 黄色标题牌 */
.plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.18rem;
  padding: 0.55rem 1.5rem 0.6rem;
  background: #f7d774;
  border: 3px solid #c8993a;
  border-radius: 14px;
  box-shadow: inset 0 -3px 0 rgba(200, 153, 58, 0.45), 0 3px 0 rgba(30, 18, 10, 0.18);
}
.ct {
  font-family: var(--f-title);
  font-size: clamp(1.05rem, 2.1vw, 1.6rem);
  letter-spacing: 0.2em;
  text-indent: 0.2em;
  color: #3c4a2e;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}
.cs {
  font-family: var(--f-num);
  font-size: clamp(0.5rem, 0.95vw, 0.68rem);
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  color: #8a6a24;
}

/* 封面小脸（参考图二的眼睛 / 腮红 / 微笑） */
.mark {
  position: absolute;
  left: 50%;
  bottom: 17%;
  width: 52%;
  height: 22%;
  transform: translateX(-50%);
  font-size: clamp(9px, 1.5vw, 15px);
}
.eye {
  position: absolute;
  top: 0;
  width: 0.62em;
  height: 0.86em;
  border-radius: 50%;
  background: var(--ink);
}
.eye:nth-child(1) {
  left: 24%;
}
.eye:nth-child(2) {
  right: 24%;
}
.blush {
  position: absolute;
  top: 40%;
  width: 1.05em;
  height: 0.6em;
  border-radius: 50%;
  background: var(--pink);
  opacity: 0.9;
}
.blush:nth-child(3) {
  left: 6%;
}
.blush:nth-child(4) {
  right: 6%;
}
.smile {
  position: absolute;
  left: 50%;
  top: 30%;
  width: 1.1em;
  height: 0.7em;
  border: 0.2em solid var(--ink);
  border-top: 0;
  border-radius: 0 0 1em 1em;
  transform: translateX(-50%);
}

/* 书签带 */
.ribbon {
  position: absolute;
  left: 16%;
  bottom: -14px;
  width: 22px;
  height: 46px;
  background: var(--yellow);
  border: 2px solid var(--ink);
  border-top: none;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 74%, 0 100%);
  box-shadow: 0 2px 0 rgba(30, 18, 10, 0.25);
}

/* 封面内侧：角色展示 */
.back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  background: radial-gradient(circle at 50% 42%, var(--bg2) 0%, var(--cream) 62%, var(--locked-fill) 100%);
  border: 2px solid var(--rule);
  padding: 0.8rem;
  box-sizing: border-box;
}
.back img {
  display: block;
  width: 78%;
  max-height: 74%;
  object-fit: contain;
  /* 素材是白底，用正片叠底让白底融进纸面 */
  mix-blend-mode: multiply;
}
.back-name {
  font-family: var(--f-title);
  font-size: clamp(0.95rem, 1.8vw, 1.2rem);
  color: var(--deep);
  letter-spacing: 0.14em;
}

/* ---------- 右页档案（字体参考图三：圆体、加粗、带投影） ---------- */
.info {
  position: relative;
  height: 100%;
  box-sizing: border-box;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  color: var(--ink);
  font-family: var(--f-title);
}
.h {
  align-self: flex-start;
  margin: 0 0 0.55rem;
  padding: 0.22rem 0.85rem 0.3rem;
  background: var(--deep);
  color: #fffdf4;
  border-radius: 10px;
  font-family: var(--f-title);
  font-size: clamp(0.98rem, 1.85vw, 1.3rem);
  font-weight: 400;
  letter-spacing: 0.14em;
  text-indent: 0.14em;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 0 3px 0 rgba(51, 64, 42, 0.22);
}
.line {
  margin: 0;
  font-family: var(--f-title);
  font-size: clamp(0.8rem, 1.28vw, 0.98rem);
  line-height: 1.95;
  letter-spacing: 0.02em;
  color: #3c4a2e;
}
.line b {
  font-weight: 400;
  color: var(--ink);
  letter-spacing: 0.06em;
}

.stamp {
  position: absolute;
  right: 0.9rem;
  bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.28rem 0.55rem;
  border: 2px dashed var(--orange);
  border-radius: 50%;
  transform: rotate(-11deg);
  font-family: var(--f-num);
  font-size: 0.58rem;
  line-height: 1.25;
  color: var(--orange);
  opacity: 0.72;
  letter-spacing: 0.06em;
}
.stamp em {
  font-style: normal;
  font-size: 0.46rem;
  letter-spacing: 0.1em;
}

.hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--deep);
  background: var(--cream);
  border: 2px solid var(--rule);
  border-radius: 999px;
  padding: 0.3rem 1.1rem;
  box-shadow: var(--shadow-pop);
}

/* ---------- 移动端：保持左右双页，只压缩尺寸与字号 ---------- */
@media (max-width: 760px) {
  .chars {
    min-height: 78vh;
    padding: 1.2rem 0.5rem 1.6rem;
  }
  .stage {
    width: min(98vw, 560px);
  }
  .book {
    aspect-ratio: 1.72 / 1;
  }
  .info {
    padding: 0.62rem 0.7rem;
    gap: 0;
  }
  .h {
    margin-bottom: 0.32rem;
    padding: 0.16rem 0.55rem 0.22rem;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    border-radius: 8px;
  }
  .line {
    font-size: 0.7rem;
    line-height: 1.72;
    letter-spacing: 0;
  }
  .stamp {
    right: 0.45rem;
    bottom: 0.35rem;
    font-size: 0.46rem;
    padding: 0.16rem 0.3rem;
    opacity: 0.5;
  }
  .stamp em {
    display: none;
  }
  .front {
    padding: 5% 8%;
  }
  .back img {
    width: 68%;
    max-height: 66%;
  }
  .ribbon {
    bottom: -10px;
    left: 12%;
    width: 18px;
    height: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book,
  .cover,
  .spread {
    transition-duration: 1ms;
  }
}
</style>
