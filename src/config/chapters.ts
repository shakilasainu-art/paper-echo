/** 板块元数据与碎片坐标（技术方案 §04/§05） */

export type ChapterId = '01' | '02' | '03' | '04' | '05' | '06' | '07'

export interface ChapterMeta {
  id: ChapterId
  title: string
  emoji: string
}

export const CHAPTERS: ChapterMeta[] = [
  { id: '01', title: '背景故事', emoji: '📖' },
  { id: '02', title: '角色介绍', emoji: '👤' },
  { id: '03', title: '衣服换装', emoji: '👗' },
  { id: '04', title: '表情收藏', emoji: '😊' },
  { id: '05', title: '动作剧场', emoji: '🎬' },
  { id: '06', title: '场景漫游', emoji: '🗺️' },
  { id: '07', title: '记忆跃迁', emoji: '✨' },
]

export function chapterMeta(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

/** 碎片在房间容器内的坐标（百分比，left/top），07 紧邻皇冠暗示「终点」 */
export const FRAGMENT_POS: Record<ChapterId, { x: number; y: number }> = {
  '01': { x: 12, y: 30 },
  '02': { x: 46, y: 18 },
  '03': { x: 74, y: 28 },
  '04': { x: 22, y: 62 },
  '05': { x: 52, y: 70 },
  '06': { x: 82, y: 58 },
  '07': { x: 50, y: 36 },
}
