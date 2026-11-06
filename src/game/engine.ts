/**
 * 07 记忆跃迁 · Canvas 2D 收集小游戏引擎（技术方案 §05）
 * - requestAnimationFrame 固定步长更新，dt 钳制 33ms
 * - ← ↓ ↑ → / WASD 与移动端虚拟方向键共用同一输入状态
 * - AABB 收集判定；集满 7 块触发 onWin
 * - 颜色一律从设计令牌读取（tokens.css），不硬编码色值
 * - 游戏内碎片复用 FragmentPiece 的 SVG 路径，保证造型一致
 */

export type Dir = 'up' | 'down' | 'left' | 'right'

export interface GameHandle {
  destroy(): void
  setInput(dir: Dir, pressed: boolean): void
}

export interface GameCallbacks {
  onCollect: (count: number, total: number) => void
  onWin: () => void
}

export const GAME_TOTAL = 7

const FRAG_PATH =
  'M38 14 a16 16 0 0 1 26 0 l2 8 12 1 a10 10 0 0 1 9 11 l-3 12 7 5 a16 16 0 0 1 -6 28 l-11 3 -2 12 a10 10 0 0 1 -13 8 l-12 -4 -8 8 a16 16 0 0 1 -27 -7 l-1 -12 -12 -3 a10 10 0 0 1 -7 -14 l6 -11 -6 -9 a16 16 0 0 1 9 -25 l12 -2 2 -11 a10 10 0 0 1 11 -9 z'

const PLAYER_R = 19
const FRAG_R = 15
const FIELD_COUNT = 3
const FRAG_SCALE = 0.34

interface Palette {
  bg: string
  bg2: string
  cream: string
  ink: string
  muted: string
  rule: string
  green: string
  yellow: string
  orange: string
  pink: string
}

interface Frag {
  x: number
  y: number
  rot: number
  spin: number
  phase: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    bg: v('--bg'),
    bg2: v('--bg2'),
    cream: v('--cream'),
    ink: v('--ink'),
    muted: v('--muted'),
    rule: v('--rule'),
    green: v('--green'),
    yellow: v('--yellow'),
    orange: v('--orange'),
    pink: v('--pink'),
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r * 0.28, y - r * 0.28)
  ctx.lineTo(x + r, y)
  ctx.lineTo(x + r * 0.28, y + r * 0.28)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r * 0.28, y + r * 0.28)
  ctx.lineTo(x - r, y)
  ctx.lineTo(x - r * 0.28, y - r * 0.28)
  ctx.closePath()
  ctx.fill()
}

export function createGame(canvas: HTMLCanvasElement, cb: GameCallbacks): GameHandle {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('[paper-echo] Canvas 2D 不可用')
  const ctx: CanvasRenderingContext2D = context

  const palette = readPalette()
  const fragPath = new Path2D(FRAG_PATH)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4
  const particlesOn = !reduced && !lowEnd

  const input: Record<Dir, boolean> = { up: false, down: false, left: false, right: false }
  const frags: Frag[] = []
  const particles: Particle[] = []

  let W = 0
  let H = 0
  const state = {
    x: 0,
    y: 0,
    face: 1,
    collected: 0,
    t: 0,
    won: false,
    paused: false,
  }

  let raf = 0
  let last = 0
  let destroyed = false

  // ---------- 尺寸 ----------
  function resize() {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(280, Math.round(rect.width))
    H = Math.max(220, Math.round(rect.height))
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (state.x === 0 && state.y === 0) {
      state.x = W / 2
      state.y = H / 2
    }
    clampPlayer()
    for (const f of frags) {
      f.x = Math.min(W - 34, Math.max(34, f.x))
      f.y = Math.min(H - 34, Math.max(34, f.y))
    }
  }

  function clampPlayer() {
    state.x = Math.min(W - 26, Math.max(26, state.x))
    state.y = Math.min(H - 26, Math.max(26, state.y))
  }

  // ---------- 碎片刷新 ----------
  function spawn() {
    if (state.collected >= GAME_TOTAL) return
    let x = W / 2
    let y = H / 2
    for (let i = 0; i < 40; i++) {
      x = 38 + Math.random() * Math.max(1, W - 76)
      y = 38 + Math.random() * Math.max(1, H - 76)
      const farFromPlayer = Math.hypot(x - state.x, y - state.y) > 86
      const farFromOthers = frags.every((f) => Math.hypot(x - f.x, y - f.y) > 56)
      if (farFromPlayer && farFromOthers) break
    }
    frags.push({
      x,
      y,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
      phase: Math.random() * Math.PI * 2,
    })
  }

  function ensureField() {
    while (frags.length < FIELD_COUNT) spawn()
  }

  function burst(x: number, y: number) {
    if (!particlesOn) return
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + Math.random() * 0.5
      const speed = 40 + Math.random() * 70
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.55 + Math.random() * 0.25,
        max: 0.8,
        size: 3 + Math.random() * 3,
      })
    }
  }

  // ---------- 键盘 ----------
  function dirOf(key: string): Dir | null {
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        return 'up'
      case 'ArrowDown':
      case 's':
      case 'S':
        return 'down'
      case 'ArrowLeft':
      case 'a':
      case 'A':
        return 'left'
      case 'ArrowRight':
      case 'd':
      case 'D':
        return 'right'
      default:
        return null
    }
  }

  function onKeydown(e: KeyboardEvent) {
    const dir = dirOf(e.key)
    if (!dir) return
    e.preventDefault()
    input[dir] = true
  }

  function onKeyup(e: KeyboardEvent) {
    const dir = dirOf(e.key)
    if (!dir) return
    input[dir] = false
  }

  function onBlur() {
    input.up = input.down = input.left = input.right = false
  }

  // ---------- 更新 ----------
  function update(dt: number) {
    state.t += dt

    const ix = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const iy = (input.down ? 1 : 0) - (input.up ? 1 : 0)
    if (ix !== 0 || iy !== 0) {
      const len = Math.hypot(ix, iy) || 1
      const speed = Math.max(150, Math.min(270, Math.min(W, H) * 0.62))
      state.x += (ix / len) * speed * dt
      state.y += (iy / len) * speed * dt
      if (ix !== 0) state.face = ix
      clampPlayer()
    }

    for (const f of frags) {
      f.rot += f.spin * dt
    }

    // AABB 收集
    for (let i = frags.length - 1; i >= 0; i--) {
      const f = frags[i]
      if (
        Math.abs(f.x - state.x) < PLAYER_R + FRAG_R &&
        Math.abs(f.y - state.y) < PLAYER_R + FRAG_R
      ) {
        frags.splice(i, 1)
        state.collected += 1
        burst(f.x, f.y)
        cb.onCollect(state.collected, GAME_TOTAL)
        if (state.collected >= GAME_TOTAL) {
          win()
          return
        }
        ensureField()
      }
    }

    // 粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life -= dt
      if (p.life <= 0) {
        particles.splice(i, 1)
        continue
      }
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx *= 0.94
      p.vy = p.vy * 0.94 + 46 * dt
    }
  }

  function win() {
    if (state.won) return
    state.won = true
    window.cancelAnimationFrame(raf)
    cb.onWin()
  }

  // ---------- 绘制 ----------
  function drawBackground() {
    ctx.fillStyle = palette.bg
    ctx.fillRect(0, 0, W, H)

    // 纸面点阵
    ctx.fillStyle = palette.rule
    ctx.globalAlpha = 0.55
    for (let x = 24; x < W; x += 32) {
      for (let y = 24; y < H; y += 32) {
        ctx.beginPath()
        ctx.arc(x, y, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1

    // 场地虚线边
    ctx.strokeStyle = palette.rule
    ctx.lineWidth = 2
    ctx.setLineDash([9, 7])
    roundedRect(ctx, 10, 10, W - 20, H - 20, 18)
    ctx.stroke()
    ctx.setLineDash([])

    // 底部草地色带（一点点纸境的地面）
    ctx.fillStyle = palette.green
    ctx.globalAlpha = 0.12
    roundedRect(ctx, 14, H - 30, W - 28, 16, 8)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  function drawFragment(f: Frag) {
    const bob = Math.sin(state.t * 2 + f.phase) * 3
    ctx.save()
    ctx.translate(f.x, f.y + bob)
    ctx.rotate(f.rot)
    ctx.scale(FRAG_SCALE, FRAG_SCALE)
    ctx.translate(-50, -50)
    ctx.shadowColor = palette.yellow
    ctx.shadowBlur = 26
    ctx.fillStyle = palette.yellow
    ctx.strokeStyle = palette.orange
    ctx.lineWidth = 7
    ctx.lineJoin = 'round'
    ctx.fill(fragPath)
    ctx.shadowBlur = 0
    ctx.stroke(fragPath)
    ctx.restore()

    // 星芒
    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.fillStyle = palette.orange
    star(ctx, f.x + 13, f.y + bob - 11, 4.5)
    ctx.restore()
  }

  function drawPlayer() {
    const bob = Math.sin(state.t * 3) * 2
    const x = state.x
    const y = state.y + bob
    const face = state.face

    // 影子
    ctx.save()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = palette.ink
    ctx.beginPath()
    ctx.ellipse(x, state.y + 24, 18, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // 耳朵
    ctx.fillStyle = palette.cream
    ctx.strokeStyle = palette.ink
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(x - 15, y - 9)
    ctx.lineTo(x - 10, y - 26)
    ctx.lineTo(x - 1, y - 15)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 15, y - 9)
    ctx.lineTo(x + 10, y - 26)
    ctx.lineTo(x + 1, y - 15)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 身体
    ctx.beginPath()
    ctx.ellipse(x, y, 19, 18, 0, 0, Math.PI * 2)
    ctx.fillStyle = palette.cream
    ctx.fill()
    ctx.stroke()

    // 围巾
    ctx.strokeStyle = palette.orange
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x, y + 3, 15, 0.2 * Math.PI, 0.8 * Math.PI)
    ctx.stroke()

    // 眼睛
    ctx.fillStyle = palette.ink
    ctx.beginPath()
    ctx.arc(x - 6 + face * 1.5, y - 4, 2.4, 0, Math.PI * 2)
    ctx.arc(x + 6 + face * 1.5, y - 4, 2.4, 0, Math.PI * 2)
    ctx.fill()

    // 腮红
    ctx.save()
    ctx.globalAlpha = 0.45
    ctx.fillStyle = palette.pink
    ctx.beginPath()
    ctx.ellipse(x - 11, y + 4, 4, 2.6, 0, 0, Math.PI * 2)
    ctx.ellipse(x + 11, y + 4, 4, 2.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save()
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = palette.yellow
      star(ctx, p.x, p.y, p.size)
      ctx.restore()
    }
  }

  function draw() {
    drawBackground()
    for (const f of frags) drawFragment(f)
    drawParticles()
    drawPlayer()
  }

  // ---------- 主循环 ----------
  function loop(t: number) {
    if (destroyed || state.paused || state.won) return
    const dt = Math.min((t - last) / 1000, 0.033)
    last = t
    update(dt)
    if (state.won) return
    draw()
    raf = requestAnimationFrame(loop)
  }

  function pause() {
    if (state.paused || state.won) return
    state.paused = true
    window.cancelAnimationFrame(raf)
  }

  function resume() {
    if (destroyed || state.won || !state.paused) return
    state.paused = false
    last = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function onVisibility() {
    if (document.hidden) pause()
    else resume()
  }

  // ---------- 启动 ----------
  resize()
  ensureField()
  draw()
  last = performance.now()
  raf = requestAnimationFrame(loop)

  const ro = new ResizeObserver(() => resize())
  ro.observe(canvas)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)
  window.addEventListener('blur', onBlur)
  document.addEventListener('visibilitychange', onVisibility)

  return {
    setInput(dir: Dir, pressed: boolean) {
      input[dir] = pressed
    },
    destroy() {
      destroyed = true
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
