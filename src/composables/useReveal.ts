/** 滚动进入视口时给 .reveal 元素加上 .in-view（技术方案 §05） */
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export function useReveal(root: Ref<HTMLElement | null>, selector = '.reveal') {
  let io: IntersectionObserver | null = null

  onMounted(() => {
    const el = root.value
    if (!el) return

    const items = Array.from(el.querySelectorAll<HTMLElement>(selector))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((i) => i.classList.add('in-view'))
      return
    }

    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            io?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    )
    items.forEach((i) => io!.observe(i))
  })

  onBeforeUnmount(() => io?.disconnect())
}
