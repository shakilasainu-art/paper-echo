/**
 * 07 记忆跃迁 · 蓝白派对迷宫
 * 固定回环路线、七块记忆碎片、周期伸缩地刺与终点判定。
 * 碰到地刺回到最近收集的碎片位置，不清空进度。
 */

import { SHARD_PATHS } from '../config/shards'

export type Dir = 'up' | 'down' | 'left' | 'right'

export interface GameHandle {
  destroy(): void
  setInput(dir: Dir, pressed: boolean): void
}

export interface GameCallbacks {
  onCollect: (count: number, total: number) => void
  onHit: (hits: number) => void
  onWin: () => void
}

export const GAME_TOTAL = 7

const WORLD_W = 1000
const WORLD_H = 650
const CORRIDOR_W = 58
const PLAYER_R = 12
const FRAG_R = 16
const SPEED = 190
const FINISH_R = 29

interface Point {
  x: number
  y: number
}

interface Segment {
  ax: number
  ay: number
  dx: number
  dy: number
  len: number
  len2: number
  start: number
  end: number
}

interface Frag extends Point {
  rot: number
  spin: number
  phase: number
  shape: number
}

interface Trap extends Point {
  offset: number
}

interface Particle extends Point {
  vx: number
  vy: number
  life: number
  max: number
  size: number
}

interface Palette {
  party: string
  white: string
  blue: string
  navy: string
  ink: string
  yellow: string
  orange: string
  pink: string
}

/* 参考路线图的长回环路线：左上 START，右下 FINISH。 */
const ROUTE: Point[] = [
  { x: 120, y: 65 },
  { x: 335, y: 65 },
  { x: 335, y: 180 },
  { x: 65, y: 180 },
  { x: 65, y: 365 },
  { x: 130, y: 365 },
  { x: 130, y: 445 },
  { x: 65, y: 445 },
  { x: 65, y: 600 },
  { x: 185, y: 600 },
  { x: 185, y: 305 },
  { x: 275, y: 305 },
  { x: 275, y: 360 },
  { x: 410, y: 360 },
  { x: 410, y: 555 },
  { x: 500, y: 555 },
  { x: 500, y: 600 },
  { x: 605, y: 600 },
  { x: 605, y: 215 },
  { x: 495, y: 215 },
  { x: 495, y: 130 },
  { x: 585, y: 130 },
  { x: 585, y: 65 },
  { x: 885, y: 65 },
  { x: 885, y: 140 },
  { x: 690, y: 140 },
  { x: 690, y: 235 },
  { x: 900, y: 235 },
  { x: 900, y: 345 },
  { x: 740, y: 345 },
  { x: 740, y: 430 },
  { x: 925, y: 430 },
  { x: 925, y: 535 },
  { x: 835, y: 535 },
  { x: 835, y: 600 },
  { x: 945, y: 600 },
]

const START = { ...ROUTE[0]! }
const FINISH = { ...ROUTE[ROUTE.length - 1]! }

let routeLength = 0
const SEGMENTS: Segment[] = ROUTE.slice(0, -1).map((p, i) => {
  const next = ROUTE[i + 1]!
  const dx = next.x - p.x
  const dy = next.y - p.y
  const len = Math.hypot(dx, dy)
  const segment = {
    ax: p.x,
    ay: p.y,
    dx,
    dy,
    len,
    len2: len * len,
    start: routeLength,
    end: routeLength + len,
  }
  routeLength += len
  return segment
})

function pointAt(ratio: number): Point {
  const distance = routeLength * ratio
  const segment = SEGMENTS.find((s) => distance <= s.end) ?? SEGMENTS[SEGMENTS.length - 1]!
  const t = Math.min(1, Math.max(0, (distance - segment.start) / segment.len))
  return { x: segment.ax + segment.dx * t, y: segment.ay + segment.dy * t }
}

function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    party: v('--party-pale'),
    white: v('--bg2'),
    blue: v('--sky'),
    navy: v('--party-deep'),
    ink: v('--ink'),
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

export function createGame(canvas: HTMLCanvasElement, cb: GameCallbacks): GameHandle {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('[paper-echo] Canvas 2D 不可用')
  const ctx: CanvasRenderingContext2D = context
  const palette = readPalette()
  const fragPaths = SHARD_PATHS.map((d) => new Path2D(d))
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4
  const particlesOn = !reduced && !lowEnd
  const input: Record<Dir, boolean> = { up: false, down: false, left: false, right: false }
  const frags: Frag[] = [0.07, 0.19, 0.31, 0.43, 0.55, 0.67, 0.79].map((at, i) => ({
    ...pointAt(at),
    rot: i * 0.7,
    spin: (i % 2 ? -1 : 1) * 0.45,
    phase: i * 0.9,
    shape: i % SHARD_PATHS.length,
  }))
  const traps: Trap[] = [0.13, 0.25, 0.37, 0.49, 0.61, 0.73, 0.88].map((at, i) => ({
    ...pointAt(at),
    offset: i * 0.43,
  }))
  const particles: Particle[] = []
  const playerImage = new Image()
  let playerLoaded = false

  let W = 0
  let H = 0
  let dpr = 1
  let raf = 0
  let last = 0
  let destroyed = false
  const state = {
    x: START.x,
    y: START.y,
    face: 1,
    moving: false,
    collected: 0,
    hits: 0,
    t: 0,
    invulnerable: 0,
    checkpoint: { ...START },
    won: false,
    paused: false,
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    W = Math.max(1, Math.round(rect.width))
    H = Math.max(1, Math.round(rect.height))
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    draw()
  }

  function distanceToRouteSquared(x: number, y: number) {
    let best = Number.POSITIVE_INFINITY
    for (const s of SEGMENTS) {
      const t = Math.min(1, Math.max(0, ((x - s.ax) * s.dx + (y - s.ay) * s.dy) / s.len2))
      const px = s.ax + s.dx * t
      const py = s.ay + s.dy * t
      const d2 = (x - px) ** 2 + (y - py) ** 2
      if (d2 < best) best = d2
    }
    return best
  }

  function canStand(x: number, y: number) {
    const allowed = CORRIDOR_W / 2 - PLAYER_R
    return distanceToRouteSquared(x, y) <= allowed * allowed
  }

  function trapAmount(trap: Trap) {
    const phase = (state.t + trap.offset) % 3.2
    if (phase < 1.15) return 0
    if (phase < 1.45) return reduced ? 1 : (phase - 1.15) / 0.3
    if (phase < 2.35) return 1
    if (phase < 2.65) return reduced ? 0 : 1 - (phase - 2.35) / 0.3
    return 0
  }

  function burst(x: number, y: number) {
    if (!particlesOn) return
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.35
      const speed = 40 + Math.random() * 65
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.65,
        max: 0.65,
        size: 3 + Math.random() * 3,
      })
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

  function move(dx: number, dy: number) {
    const nx = state.x + dx
    const ny = state.y + dy
    if (canStand(nx, ny)) {
      state.x = nx
      state.y = ny
      return
    }
    if (canStand(nx, state.y)) state.x = nx
    if (canStand(state.x, ny)) state.y = ny
  }

  function hitTrap() {
    state.hits += 1
    state.x = state.checkpoint.x
    state.y = state.checkpoint.y
    state.invulnerable = 1.2
    cb.onHit(state.hits)
  }

  function update(dt: number) {
    state.t += dt
    state.invulnerable = Math.max(0, state.invulnerable - dt)

    const ix = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    const iy = (input.down ? 1 : 0) - (input.up ? 1 : 0)
    state.moving = ix !== 0 || iy !== 0
    if (state.moving) {
      const len = Math.hypot(ix, iy)
      move((ix / len) * SPEED * dt, (iy / len) * SPEED * dt)
      if (ix !== 0) state.face = ix
    }

    for (let i = frags.length - 1; i >= 0; i--) {
      const f = frags[i]!
      if (!reduced) f.rot += f.spin * dt
      if (Math.hypot(f.x - state.x, f.y - state.y) < PLAYER_R + FRAG_R) {
        frags.splice(i, 1)
        state.collected += 1
        state.checkpoint = { x: f.x, y: f.y }
        burst(f.x, f.y)
        cb.onCollect(state.collected, GAME_TOTAL)
      }
    }

    if (state.invulnerable <= 0) {
      for (const trap of traps) {
        if (trapAmount(trap) > 0.72 && Math.hypot(trap.x - state.x, trap.y - state.y) < 23) {
          hitTrap()
          break
        }
      }
    }

    if (
      state.collected === GAME_TOTAL &&
      Math.hypot(FINISH.x - state.x, FINISH.y - state.y) < FINISH_R
    ) {
      win()
      return
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!
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

  function traceRoute() {
    ctx.beginPath()
    ctx.moveTo(ROUTE[0]!.x, ROUTE[0]!.y)
    for (let i = 1; i < ROUTE.length; i++) ctx.lineTo(ROUTE[i]!.x, ROUTE[i]!.y)
  }

  function drawBalloon(x: number, y: number, color: string) {
    ctx.save()
    ctx.globalAlpha = 0.48
    ctx.fillStyle = color
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(x, y, 20, 26, -0.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y + 26)
    ctx.lineTo(x - 4, y + 33)
    ctx.lineTo(x + 4, y + 33)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x, y + 33)
    ctx.bezierCurveTo(x + 16, y + 55, x - 18, y + 67, x + 3, y + 91)
    ctx.stroke()
    ctx.restore()
  }

  function drawBackground() {
    ctx.fillStyle = palette.party
    ctx.fillRect(0, 0, WORLD_W, WORLD_H)

    const colors = [palette.blue, palette.white, palette.yellow, palette.pink]
    for (let i = 0; i < 48; i++) {
      const x = 12 + ((i * 137) % (WORLD_W - 24))
      const y = 18 + ((i * 223) % (WORLD_H - 36))
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(i * 0.71)
      ctx.globalAlpha = 0.52
      ctx.fillStyle = colors[i % colors.length]!
      if (i % 3 === 0) {
        ctx.beginPath()
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-2, -6, 4, 12)
      }
      ctx.restore()
    }

    ctx.save()
    ctx.globalAlpha = 0.45
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, 22)
    ctx.quadraticCurveTo(WORLD_W / 2, 50, WORLD_W, 22)
    ctx.stroke()
    for (let x = 28, i = 0; x < WORLD_W; x += 55, i++) {
      const y = 27 + Math.sin((x / WORLD_W) * Math.PI) * 12
      ctx.fillStyle = colors[i % colors.length]!
      ctx.beginPath()
      ctx.moveTo(x - 10, y)
      ctx.lineTo(x + 10, y + 2)
      ctx.lineTo(x, y + 22)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()

    drawBalloon(280, 585, palette.white)
    drawBalloon(450, 55, palette.blue)
    drawBalloon(710, 565, palette.white)
  }

  function drawMaze() {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    traceRoute()
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = CORRIDOR_W + 14
    ctx.stroke()
    traceRoute()
    ctx.strokeStyle = palette.blue
    ctx.lineWidth = CORRIDOR_W + 7
    ctx.stroke()
    traceRoute()
    ctx.strokeStyle = palette.white
    ctx.lineWidth = CORRIDOR_W
    ctx.stroke()

    ctx.fillStyle = palette.white
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 3
    roundedRect(ctx, 17, 43, 96, 48, 22)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = palette.navy
    ctx.font = '700 15px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('START', 65, 68)

    if (state.collected > 0) {
      ctx.save()
      ctx.strokeStyle = palette.blue
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(state.checkpoint.x, state.checkpoint.y, 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }

  function drawFinish() {
    const open = state.collected === GAME_TOTAL
    ctx.save()
    ctx.fillStyle = open ? palette.yellow : palette.white
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(FINISH.x, FINISH.y, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = open ? palette.orange : palette.blue
    star(ctx, FINISH.x, FINISH.y, 11)
    ctx.fillStyle = palette.navy
    ctx.font = '700 14px Outfit, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('FINISH', 910, 632)
    if (!open) {
      ctx.font = '700 12px sans-serif'
      ctx.fillText('集齐 7 块开启', 885, 565)
    }
    ctx.restore()
  }

  function drawFragment(f: Frag) {
    const bob = reduced ? 0 : Math.sin(state.t * 2.4 + f.phase) * 3
    const fy = f.y + bob

    // 地面投影
    ctx.save()
    ctx.globalAlpha = 0.16
    ctx.fillStyle = palette.navy
    ctx.beginPath()
    ctx.ellipse(f.x + 3, fy + 19, 15, 5.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.translate(f.x, fy)
    ctx.rotate(f.rot)
    ctx.scale(0.34, 0.34)
    ctx.translate(-50, -50)
    const path = fragPaths[f.shape]!

    // 侧面厚度：深金色垫底
    ctx.save()
    ctx.translate(2, 7)
    ctx.fillStyle = '#C86C1C'
    ctx.fill(path)
    ctx.restore()

    // 顶面：上亮下暗的金色渐变 + 外发光
    const gold = ctx.createLinearGradient(0, 6, 0, 94)
    gold.addColorStop(0, '#FFF3C0')
    gold.addColorStop(0.36, '#FCE07A')
    gold.addColorStop(0.72, '#F5C842')
    gold.addColorStop(1, '#E6A02A')
    ctx.shadowColor = 'rgba(245, 200, 66, 0.85)'
    ctx.shadowBlur = 16
    ctx.fillStyle = gold
    ctx.fill(path)
    ctx.shadowBlur = 0

    // 顶面高光
    ctx.save()
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#FFFDF0'
    ctx.beginPath()
    ctx.ellipse(38, 34, 14, 8, -0.55, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.strokeStyle = '#D98A24'
    ctx.lineWidth = 3.2
    ctx.lineJoin = 'round'
    ctx.stroke(path)
    ctx.restore()

    ctx.fillStyle = palette.orange
    star(ctx, f.x + 14, fy - 14, 4)
  }

  function drawTrap(trap: Trap) {
    const amount = trapAmount(trap)
    ctx.save()
    ctx.translate(trap.x, trap.y)
    ctx.fillStyle = palette.blue
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 2.5
    roundedRect(ctx, -23, -23, 46, 46, 9)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = palette.party
    roundedRect(ctx, -17, -17, 34, 34, 5)
    ctx.fill()

    for (const ox of [-9, 9]) {
      for (const oy of [-9, 9]) {
        const h = 4 + amount * 15
        const base = oy + 7
        ctx.beginPath()
        ctx.moveTo(ox - 5, base)
        ctx.lineTo(ox, base - h)
        ctx.lineTo(ox + 5, base)
        ctx.closePath()
        ctx.fillStyle = palette.white
        ctx.strokeStyle = palette.navy
        ctx.lineWidth = 1.4
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ox, base - h + 3)
        ctx.lineTo(ox + 2.5, base - 1)
        ctx.strokeStyle = palette.blue
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  function drawFallbackPlayer(x: number, y: number) {
    ctx.fillStyle = palette.blue
    ctx.strokeStyle = palette.navy
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.ellipse(x - 20, y - 1, 10, 24, 0.25, 0, Math.PI * 2)
    ctx.ellipse(x + 20, y - 1, 10, 24, -0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = palette.white
    ctx.beginPath()
    ctx.ellipse(x, y, 21, 23, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = palette.yellow
    ctx.beginPath()
    ctx.moveTo(x - 13, y - 24)
    ctx.lineTo(x - 12, y - 38)
    ctx.lineTo(x - 4, y - 30)
    ctx.lineTo(x + 2, y - 41)
    ctx.lineTo(x + 10, y - 29)
    ctx.lineTo(x + 14, y - 36)
    ctx.lineTo(x + 13, y - 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = palette.ink
    ctx.beginPath()
    ctx.ellipse(x - 7, y - 5, 2.3, 4, 0, 0, Math.PI * 2)
    ctx.ellipse(x + 7, y - 5, 2.3, 4, 0, 0, Math.PI * 2)
    ctx.ellipse(x, y + 3, 6, 5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawPlayer() {
    const bob = reduced || !state.moving ? 0 : Math.sin(state.t * 10) * 1.5
    ctx.save()
    if (state.invulnerable > 0) {
      ctx.globalAlpha = reduced ? 0.6 : Math.floor(state.invulnerable * 12) % 2 ? 0.35 : 1
    }
    ctx.globalAlpha *= 0.16
    ctx.fillStyle = palette.navy
    ctx.beginPath()
    ctx.ellipse(state.x, state.y + 23, 19, 5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.save()
    if (state.invulnerable > 0) {
      ctx.globalAlpha = reduced ? 0.6 : Math.floor(state.invulnerable * 12) % 2 ? 0.35 : 1
    }
    ctx.translate(state.x, state.y + bob)
    ctx.scale(state.face, 1)
    if (playerLoaded) {
      ctx.drawImage(playerImage, -32, -39, 64, 65)
    } else {
      drawFallbackPlayer(0, 0)
    }
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
    if (destroyed || W === 0 || H === 0) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = palette.party
    ctx.fillRect(0, 0, W, H)
    const scale = Math.min(W / WORLD_W, H / WORLD_H)
    const ox = (W - WORLD_W * scale) / 2
    const oy = (H - WORLD_H * scale) / 2
    ctx.save()
    ctx.translate(ox, oy)
    ctx.scale(scale, scale)
    drawBackground()
    drawMaze()
    drawFinish()
    for (const trap of traps) drawTrap(trap)
    for (const f of frags) drawFragment(f)
    drawParticles()
    drawPlayer()
    ctx.restore()
  }

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

  playerImage.onload = () => {
    playerLoaded = true
    draw()
  }
  playerImage.src = new URL('../assets/img/pe_game_yuanyuan.webp', import.meta.url).href

  resize()
  last = performance.now()
  raf = requestAnimationFrame(loop)

  const ro = new ResizeObserver(resize)
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
      playerImage.onload = null
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    },
  }
}
