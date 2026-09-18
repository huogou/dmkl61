/**
 * useSpriteAnimation —— 一个由 requestAnimationFrame 驱动的通用逐帧播放器。
 *
 * 帧节奏按「真实流逝时间 / 每帧时长」推进（累加器），比 setInterval 固定节拍
 * 更稳：不累积漂移、不因解码/GC 抖动而抢帧；隐藏/遮挡导致的超大间隔封顶，
 * 恢复后不会一次跳飞。它只持有播放游标这一项状态：给它一个帧列表，调用
 * `play()`，然后读取 `currentSrc`。循环还是一次性播放由每次 `play()` 决定，
 * 一次性播放在结束时会触发 `onDone`。
 *
 * 它有意对动作注册表和状态机一无所知 —— 那些都在 `useCatBrain` 中。
 */
import { computed, onScopeDispose, ref, type Ref } from 'vue'

export interface SpriteAnimationOptions {
  /** 每秒帧数。默认 24。 */
  fps?: number
  /** 为 true 时永久循环;为 false 时播放一次后停止。默认 false。 */
  loop?: boolean
  /**
   * 循环时,到达末尾后从哪个帧索引重新开始。位于其之前的帧作为开场只播放一次。
   * 除非 `loop` 为 true,否则忽略此项。默认 0。
   */
  loopFrom?: number
}

export interface SpriteAnimationController {
  /** 此刻要显示的帧的响应式 URL(空闲时为空字符串)。 */
  currentSrc: Ref<string>
  /** 当前是否有序列正在播放。 */
  isPlaying: Ref<boolean>
  /** 在当前活动帧列表中的当前帧索引(从 0 开始)。 */
  frameIndex: Ref<number>
  /**
   * 开始播放 `frames`。若已在播放,则从 frame 0 重新开始。
   * `opts` 会覆盖本次运行中传给该组合式函数的默认值。
   * 当非循环序列到达其最后一帧时,`onDone` 触发一次(`loop: true` 时永不触发)。
   */
  play: (
    frames: string[],
    opts?: SpriteAnimationOptions,
    onDone?: () => void,
  ) => void
  /** 立即停止。不触发 `onDone`。清空 `currentSrc`。 */
  stop: () => void
}

/** 单次 rAF 间隔允许推进的最大时长（毫秒）。超过视为卡顿/被遮挡，避免一次跳飞。 */
const MAX_STEP_MS = 250

/** 帧列表 → 已触发预解码标记；同一份列表只预热一次（避免动作切换反复解码）。 */
const warmed = new WeakSet<readonly string[]>()

/** 预解码一段帧列表：立即触发 fetch（走缓存）+ decode，消除首轮播放的解码卡顿。 */
function warmDecode(list: readonly string[]) {
  if (warmed.has(list)) return
  warmed.add(list)
  for (const u of list) {
    const img = new Image()
    img.decoding = 'async'
    img.src = u
    img.decode().catch(() => {
      /* 解码失败不致命，播放时浏览器自会兜底 */
    })
  }
}

export function useSpriteAnimation(
  defaults: SpriteAnimationOptions = {},
): SpriteAnimationController {
  const frames = ref<string[]>([])
  const frameIndex = ref(0)
  const isPlaying = ref(false)
  let rafId: number | undefined
  let doneCb: (() => void) | undefined

  const currentSrc = computed(() => {
    const list = frames.value
    if (!isPlaying.value || list.length === 0) return ''
    return list[Math.min(frameIndex.value, list.length - 1)] ?? ''
  })

  function clearRaf() {
    if (rafId !== undefined) {
      cancelAnimationFrame(rafId)
      rafId = undefined
    }
  }

  function stop() {
    clearRaf()
    isPlaying.value = false
    doneCb = undefined
  }

  function play(
    list: string[],
    opts: SpriteAnimationOptions = {},
    onDone?: () => void,
  ) {
    clearRaf()
    if (!list || list.length === 0) {
      isPlaying.value = false
      return
    }

    const fps = opts.fps ?? defaults.fps ?? 24
    const loop = opts.loop ?? defaults.loop ?? false
    // 将循环点钳制到有效范围内;无效值则直接循环整个列表。
    const rawLoopFrom = opts.loopFrom ?? defaults.loopFrom ?? 0
    const loopFrom =
      rawLoopFrom > 0 && rawLoopFrom < list.length ? rawLoopFrom : 0
    const frameMs = 1000 / fps

    // 预解码本片段，首轮播放不因解码停顿。
    warmDecode(list)

    frames.value = list
    frameIndex.value = 0
    isPlaying.value = true
    doneCb = onDone

    let lastTs = 0
    let acc = 0

    const tick = (ts: number) => {
      rafId = requestAnimationFrame(tick)
      if (lastTs === 0) {
        lastTs = ts
        return
      }
      let dt = ts - lastTs
      lastTs = ts
      if (dt > MAX_STEP_MS) dt = MAX_STEP_MS
      if (!isPlaying.value) return // 已在回调间隙被 stop()
      acc += dt
      while (acc >= frameMs) {
        acc -= frameMs
        const next = frameIndex.value + 1
        if (next >= list.length) {
          if (loop) {
            frameIndex.value = loopFrom
          } else {
            // 停留在最后一帧,停止播放,然后发出通知。
            frameIndex.value = list.length - 1
            clearRaf()
            isPlaying.value = false
            const cb = doneCb
            doneCb = undefined
            cb?.()
            return
          }
        } else {
          frameIndex.value = next
        }
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  onScopeDispose(stop)

  return { currentSrc, isPlaying, frameIndex, play, stop }
}
