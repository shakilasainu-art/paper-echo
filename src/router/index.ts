/**
 * hash 路由表（技术方案 §04）
 * /game 需 7/7 点亮；/ending 需通关
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import { useProgress } from '../stores/progress'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'intro',
      component: () => import('../views/IntroView.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/chapter/01',
      name: 'story',
      component: () => import('../views/chapters/StoryView.vue'),
    },
    {
      path: '/chapter/02',
      name: 'characters',
      component: () => import('../views/chapters/CharactersView.vue'),
    },
    {
      path: '/chapter/03',
      name: 'outfits',
      component: () => import('../views/chapters/OutfitsView.vue'),
    },
    {
      path: '/chapter/04',
      name: 'emojis',
      component: () => import('../views/chapters/EmojisView.vue'),
    },
    {
      path: '/chapter/05',
      name: 'theater',
      component: () => import('../views/chapters/TheaterView.vue'),
    },
    {
      path: '/chapter/06',
      name: 'scenes',
      component: () => import('../views/chapters/ScenesView.vue'),
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/MiniGameView.vue'),
      beforeEnter: (_to, _from) => {
        const progress = useProgress()
        return progress.gameUnlocked ? true : { path: '/home' }
      },
    },
    {
      path: '/ending',
      name: 'ending',
      component: () => import('../views/EndingView.vue'),
      beforeEnter: (_to, _from) => {
        const progress = useProgress()
        return progress.data.gameCompleted ? true : { path: '/game' }
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
})

export default router
