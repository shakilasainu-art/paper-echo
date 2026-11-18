/** 板块 01/02 的内容数据 */

export const STORY_EPIGRAPH = [
  '星光亮起的地方，就会有一场新的聚会。',
  '这里不催你说话，也不怕你安静，',
  '只要愿意来，总有人在同一片星光下等你。',
]

export const STORY_PARAGRAPHS = [
  '这片悬浮在星云里的岛屿，被一圈发光的紫粉色星环包裹。云朵慢悠悠地漂浮，星星散落遍地，岛上长满软乎乎的小花，风一吹，就整片整片地晃。',
  '星环上每一个光点亮起，就代表一场新的聚会诞生。有人循着光来，有人只是路过，抬头看见那一点亮，就决定今晚不再一个人待着。',
  '元元是这座岛屿的专属派对向导。它负责接住每一个孤单、想找搭子的人：可以在线上房间开狼人杀、K 歌连麦；也可以相约奔赴线下，举杯相聚。',
  '在这里没有生硬的社交压力，热闹和安静都被接纳。想闹就闹到深夜，想坐着看星星也不会有人催你融入。',
  '只要星光亮起，随时都能遇见同频的伙伴。',
]

export const STORY_PULL_QUOTE = '只要星光亮起，随时都能遇见同频的伙伴。'
export const STORY_PULL_NOTE = '—— 元元的向导手记'

/** ================= M4：结局 ================= */

export const ENDING_COPY = {
  kicker: '07 / 07 · 记忆完整',
  title: '碎冠忆旅',
  lead: '七块碎片回到了原来的位置，房间里的灯一盏一盏醒了过来。',
  lines: [
    '皇冠亮起来的那一刻，纸境里所有没说完的话，都接上了下半句。',
    '元元把最后一页轻轻合上。故事里的他们没有停在原地，而是继续往前走——走向你们一起读过的那几页。',
    '谢谢你慢慢地走完这趟旅程。纸会记住碰过它的人，也会记住你。',
  ],
  sign: '—— 纸境手记 · 最后一页',
  shareTitle: '碎冠忆旅 · 纪念卡',
  shareQuote: '故事不会消失，它只是碎成了光。',
}


export interface Character {
  id: string
  name: string
  role: string
  avatar: string
  tags: string[]
  intro: string
  quote: string
}

/** ================= M3：03 衣服换装 ================= */

export type OutfitKind = 'pinafore' | 'raincoat' | 'nightgown' | 'sailor' | 'cape'

export interface Outfit {
  id: string
  name: string
  subtitle: string
  kind: OutfitKind
  desc: string
  tags: string[]
  note: string
  main: string
  accent: string
}

export const OUTFITS_DATA: Outfit[] = [
  {
    id: 'sprout',
    name: '纸芽日常',
    subtitle: '洗得发白的背带裙',
    kind: 'pinafore',
    desc: '元元最常穿的一套。裙摆上有一块洗不掉的绿颜料，是那年春天在纸森林蹭上的。她总说，衣服要留一点「发生过」的证据。',
    tags: ['日常', '口袋很深', '耐脏'],
    note: '左口袋：三颗纽扣、半块糖、一片压平的叶子',
    main: 'yellow',
    accent: 'green',
  },
  {
    id: 'rain',
    name: '雨天苔绿',
    subtitle: '下雨也不怕的苔绿雨衣',
    kind: 'raincoat',
    desc: '帽檐压得很低的时候，元元会假装自己是墨墨。雨衣是旧的，但每次穿上，都像把整个雨季抱进怀里。雨点落在上面，会发出很轻的沙沙声。',
    tags: ['雨天', '兜帽', '会响'],
    note: '袖口：两颗备用纽扣 · 帽子里藏着一片干花瓣',
    main: 'green',
    accent: 'yellow',
  },
  {
    id: 'moon',
    name: '月白睡裙',
    subtitle: '袖口绣着小月亮',
    kind: 'nightgown',
    desc: '灯关掉以后才穿。裙摆很长，走路时会扫过地板，像纸页翻过去的声音。元元说，穿着它做的梦，醒来时会更轻一点。',
    tags: ['夜晚', '柔软', '怕冷'],
    note: '裙角：洗到发白 · 领口有一小块补丁',
    main: 'sky',
    accent: 'yellow',
  },
  {
    id: 'stream',
    name: '溪畔水手',
    subtitle: '为了坐纸船特意换的',
    kind: 'sailor',
    desc: '领子后面缝了一条蓝色带子，风一吹就会飘。元元说，这样纸船就知道她来了，会靠岸等她。其实纸船一直都很乖，只是她喜欢这个理由。',
    tags: ['出行', '清爽', '爱起风'],
    note: '后领：手缝蓝带 · 口袋里有一只小纸船',
    main: 'cream',
    accent: 'sky',
  },
  {
    id: 'star',
    name: '星夜披风',
    subtitle: '只在特别的日子穿',
    kind: 'cape',
    desc: '披风是铃铃用旧窗帘改的，内衬是柠檬黄。元元答应过她，等七块碎片都亮起来，就穿着它去屋顶看星星。这个约定，她一直记得。',
    tags: ['特别的日子', '手作', '有星星'],
    note: '内衬：铃铃缝的 · 纽扣是墨墨从风里捡回来的',
    main: 'deep',
    accent: 'yellow',
  },
]

/** ================= M3：04 表情收藏 ================= */

export type EmojiExpression =
  | 'curious'
  | 'hungry'
  | 'sideeye'
  | 'shy'
  | 'joy'
  | 'stuffed'
  | 'angry'
  | 'sleepy'

export interface Sticker {
  id: string
  owner: string
  name: string
  expression: EmojiExpression
  tone: string
  trigger: string
}

export const STICKERS_DATA: Sticker[] = [
  {
    id: 'curious',
    owner: '元元',
    name: '凑近看看',
    expression: 'curious',
    tone: 'yellow',
    trigger: '咦？这块拼图的边，好像和刚才那块对不上呀。',
  },
  {
    id: 'hungry',
    owner: '团子',
    name: '再来一口',
    expression: 'hungry',
    tone: 'orange',
    trigger: '这块……是饼干吗？（擦口水）不是的话，我也先尝一口。',
  },
  {
    id: 'sideeye',
    owner: '墨墨',
    name: '假装没看见',
    expression: 'sideeye',
    tone: 'deep',
    trigger: '风又来翻页了。我什么都没看见，也什么都不会说。',
  },
  {
    id: 'shy',
    owner: '铃铃',
    name: '躲到铃铛后',
    expression: 'shy',
    tone: 'pink',
    trigger: '别、别一直看我……我唱歌的时候，可以给你听。',
  },
  {
    id: 'joy',
    owner: '元元',
    name: '找到啦',
    expression: 'joy',
    tone: 'green',
    trigger: '找到啦！我就说它一定在这儿——你看，光还在闪。',
  },
  {
    id: 'stuffed',
    owner: '团子',
    name: '最后一口',
    expression: 'stuffed',
    tone: 'sky',
    trigger: '再吃一口，就一口。吃完这口，我就帮你搬碎片。',
  },
  {
    id: 'angry',
    owner: '墨墨',
    name: '谁动了纸帽',
    expression: 'angry',
    tone: 'yellow',
    trigger: '谁碰了我的纸帽？站住。别以为我白天看不清楚。',
  },
  {
    id: 'sleepy',
    owner: '铃铃',
    name: '铃铛里打盹',
    expression: 'sleepy',
    tone: 'pink',
    trigger: '呼……呼……我没睡，只是把眼睛借给星星用一会儿。',
  },
]

/** 贴纸墙上留给新表情的空位 */
export const STICKER_EMPTY_SLOTS = [1, 2, 3, 4]

/** ================= M3：05 动作剧场 ================= */

export type ActKind = 'roll' | 'stretch' | 'sway' | 'spin'

export interface Clip {
  id: string
  name: string
  owner: string
  characterId: string
  duration: number
  kind: ActKind
  line: string
}

export const CLIPS_DATA: Clip[] = [
  {
    id: 'tuanzi-roll',
    name: '团子打滚',
    owner: '团子',
    characterId: 'tuanzi',
    duration: 6,
    kind: 'roll',
    line: '它滚过一页，又滚回来，把地上的灰都粘走了。',
  },
  {
    id: 'momo-stretch',
    name: '墨墨伸懒腰',
    owner: '墨墨',
    characterId: 'momo',
    duration: 7,
    kind: 'stretch',
    line: '伸到一半，它忽然停住，假装自己只是一张普通的纸。',
  },
  {
    id: 'lingling-song',
    name: '铃铃的小夜曲',
    owner: '铃铃',
    characterId: 'lingling',
    duration: 9,
    kind: 'sway',
    line: '她唱得很轻，碎片却一块一块地自己靠了过来。',
  },
  {
    id: 'yuanyuan-spin',
    name: '元元转圈圈',
    owner: '元元',
    characterId: 'yuanyuan',
    duration: 5,
    kind: 'spin',
    line: '转到第三圈时，她终于分不清哪边是出口了。',
  },
]

/** ================= M3：06 场景漫游 ================= */

export interface Scene {
  id: string
  title: string
  caption: string
  alt: string
  img: string
}

export const SCENES_DATA: Scene[] = [
  {
    id: 'creek',
    title: '溪畔踏秋 · 金色的出发',
    caption: '元元踩着清凉的溪水，穿过层层落叶。小皇冠被夕阳照亮，新的旅程就从这一片金色里开始。',
    alt: '秋日森林中，戴着小皇冠的元元站在金色溪水与落叶之间',
    img: new URL('../assets/img/pe_scene_01_creek.webp', import.meta.url).href,
  },
  {
    id: 'campfire',
    title: '林间夜营 · 篝火与萤火',
    caption: '帐篷亮起暖光，溪水把篝火轻轻带向远方。萤火虫在树间巡逻，守着今晚不想睡的故事。',
    alt: '夜晚的森林里，帐篷、篝火、萤火虫与溪流相互映衬',
    img: new URL('../assets/img/pe_scene_02_campfire.webp', import.meta.url).href,
  },
  {
    id: 'camping',
    title: '秋日露营 · 把秋天铺好',
    caption: '铺一张野餐垫，摆好南瓜和点心。风从帐篷边经过，元元决定把这一刻留得再久一点。',
    alt: '元元在秋日营地铺野餐垫，身旁有帐篷、南瓜和篝火',
    img: new URL('../assets/img/pe_scene_03_camping.webp', import.meta.url).href,
  },
  {
    id: 'berries',
    title: '红果采集 · 森林的甜味',
    caption: '阳光穿过枝叶，红果在篮子里越堆越高。元元把最大的一颗留给你，也收下森林甜甜的回礼。',
    alt: '阳光森林中，元元手提篮子采摘红果',
    img: new URL('../assets/img/pe_scene_04_berries.webp', import.meta.url).href,
  },
  {
    id: 'expedition',
    title: '溪畔探险 · 跟着水声走',
    caption: '背好小包，沿着溪岸向前走。每一次转弯都藏着新的风景，小皇冠也在替勇敢闪闪发亮。',
    alt: '戴着皇冠、背包的元元沿秋日溪畔向前探险',
    img: new URL('../assets/img/pe_scene_05_expedition.webp', import.meta.url).href,
  },
  {
    id: 'picnic',
    title: '晴日野餐 · 花边的午休',
    caption: '蘑菇、花草和野餐篮都到齐了。玩累了就坐在溪边，让阳光和微风一起完成今天的结尾。',
    alt: '阳光森林的溪边，元元与野餐篮、蘑菇和花草一起午休',
    img: new URL('../assets/img/pe_scene_06_picnic.webp', import.meta.url).href,
  },
]

export const CHARACTERS_DATA: Character[] = [
  {
    id: 'yuanyuan',
    name: '元元',
    role: '纸境的拾光者',
    avatar: new URL('../assets/img/pe_char_yuanyuan_2x.webp', import.meta.url).href,
    tags: ['好奇', '勇敢', '收集癖'],
    intro:
      '住在阁楼最上层的小女孩。银白色的头发总是睡乱，笑起来脸颊会红。她相信每块碎片都还留着原来的温度，所以捡起来时总会先捂在掌心一会儿。',
    quote: '只要还有一块碎片，故事就没结束。',
  },
  {
    id: 'tuanzi',
    name: '团子',
    role: '会走路的纸团',
    avatar: new URL('../assets/img/pe_char_tuanzi_2x.webp', import.meta.url).href,
    tags: ['贪吃', '软乎乎', '慢半拍'],
    intro:
      '没人说得清它是从哪一页纸上揉出来的。它走路很慢，说话也很慢，但如果元元走得太远，它会第一个追上来。',
    quote: '吃一口，记忆就暖一点。',
  },
  {
    id: 'momo',
    name: '墨墨',
    role: '折纸猫',
    avatar: new URL('../assets/img/pe_char_momo_2x.webp', import.meta.url).href,
    tags: ['夜行', '毒舌', '护主'],
    intro:
      '头上永远顶着那只折得歪歪的纸帽。白天几乎见不到它，夜里却总在窗台上守着，像一盏不怎么说话的小灯。',
    quote: '我不喜欢风，但愿意陪你去追它。',
  },
  {
    id: 'lingling',
    name: '铃铃',
    role: '铃音精灵',
    avatar: new URL('../assets/img/pe_char_lingling_2x.webp', import.meta.url).href,
    tags: ['温柔', '怕生', '爱唱歌'],
    intro:
      '住在旧铃铛里的小小精灵。她不太敢直视别人的眼睛，却会把听过的故事都唱成歌，唱得久了，碎片会自己找过来。',
    quote: '我唱歌的时候，碎片会自己飞过来。',
  },
]
