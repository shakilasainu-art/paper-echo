/**
 * 进度状态机（技术方案 §04）
 * 碎片三态：locked → available → lit
 * 持久化：localStorage，version 字段异常时自动重置
 */
import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ChapterId } from '../config/chapters'

export type FragState = 'locked' | 'available' | 'lit'

interface SaveData {
  version: 1
  fragments: Record<ChapterId, FragState>
  gameCompleted: boolean
  /** 首次进入任一板块的时间（用于结局纪念卡的「旅程用时」） */
  startedAt?: number
  /** 小游戏通关时间 */
  completedAt?: number
}

const CHAPTER_IDS: ChapterId[] = ['01', '02', '03', '04', '05', '06']

const STORAGE_KEY = 'paper-echo-save-v1'

function initial(): SaveData {
  return {
    version: 1,
    fragments: {
      '01': 'locked', '02': 'locked', '03': 'locked',
      '04': 'locked', '05': 'locked', '06': 'locked', '07': 'locked',
    },
    gameCompleted: false,
  }
}

function load(): SaveData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SaveData
    if (parsed?.version !== 1 || typeof parsed.fragments !== 'object') {
      console.warn('[paper-echo] 存档版本异常，已重置')
      return null
    }
    return parsed
  } catch {
    console.warn('[paper-echo] 存档解析失败，已重置')
    return null
  }
}

function persist(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* 隐私模式等场景静默失败：进度仅在内存中保留 */
  }
}

export const useProgress = defineStore('progress', () => {
  const data = reactive<SaveData>(load() ?? initial())

  /** 兼容旧存档：01–06 全部点亮但 07 仍为 locked 时，开放 07 入口 */
  if (data.fragments['07'] === 'locked' && CHAPTER_IDS.every((id) => data.fragments[id] === 'lit')) {
    data.fragments['07'] = 'available'
  }

  /** 刚刚点亮的碎片（仅内存，供首页播回场动画） */
  const lastLitId = ref<ChapterId | null>(null)

  const litCount = computed(
    () => Object.values(data.fragments).filter((s) => s === 'lit').length,
  )
  const allLit = computed(() => litCount.value === 7)

  /** 01–06 是否全部点亮（决定 07 记忆跃迁是否开放） */
  const chaptersLit = computed(() => CHAPTER_IDS.every((id) => data.fragments[id] === 'lit'))
  const gameUnlocked = computed(() => chaptersLit.value)
  /** 还差几块板块碎片（用于锁定提示） */
  const chaptersRemaining = computed(
    () => CHAPTER_IDS.filter((id) => data.fragments[id] !== 'lit').length,
  )

  /** 进入板块：locked → available */
  function visit(id: ChapterId) {
    if (!data.startedAt) data.startedAt = Date.now()
    if (data.fragments[id] === 'locked') {
      data.fragments[id] = 'available'
    }
    persist(data)
  }

  /** 浏览完成：点亮碎片 */
  function light(id: ChapterId) {
    if (!data.startedAt) data.startedAt = Date.now()
    data.fragments[id] = 'lit'
    lastLitId.value = id
    // 六个板块集齐后，07 从灰纸态转为可探索
    if (data.fragments['07'] === 'locked' && CHAPTER_IDS.every((k) => data.fragments[k] === 'lit')) {
      data.fragments['07'] = 'available'
    }
    persist(data)
  }

  /** 取出并清空「刚点亮」标记（避免重复播放动画） */
  function consumeLastLit(): ChapterId | null {
    const id = lastLitId.value
    lastLitId.value = null
    return id
  }

  /** 小游戏通关：点亮 07，记录时间 */
  function completeGame() {
    data.gameCompleted = true
    data.fragments['07'] = 'lit'
    data.completedAt = Date.now()
    persist(data)
  }

  /** 重新开始 */
  function reset() {
    const fresh = initial()
    data.fragments = fresh.fragments
    data.gameCompleted = false
    data.startedAt = undefined
    data.completedAt = undefined
    lastLitId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    data,
    lastLitId,
    litCount,
    allLit,
    chaptersLit,
    gameUnlocked,
    chaptersRemaining,
    visit,
    light,
    consumeLastLit,
    completeGame,
    reset,
  }
})
