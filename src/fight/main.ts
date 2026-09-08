/**
 * 打架/互动窗口入口：
 * 加载 res_v2/fight/ 下的帧，逐帧播放，播完通知后端关闭。
 */
import { invoke, convertFileSrc } from '@tauri-apps/api/core'

const FPS = 24

async function loadFightFrames(): Promise<string[]> {
  try {
    // 获取默认猫的 resource root，拼出 fight 目录绝对路径
    const cat = await invoke<{ resource_root?: string | null }>('pet_load_cat', { catId: 'default' })
    const root = cat?.resource_root
    if (!root) {
      console.error('[fight] no resource_root configured')
      return []
    }
    const fightDir = root.replace(/[\\/]+$/, '') + '/fight'
    const entries = await invoke<string[]>('pet_list_frames_dir', { dir: fightDir })
    if (!entries || entries.length === 0) {
      console.error('[fight] no frames found in', fightDir)
      return []
    }
    return entries.map((p) => convertFileSrc(p))
  } catch (e) {
    console.error('[fight] failed to load frames:', e)
    return []
  }
}

async function main() {
  const img = document.getElementById('frame') as HTMLImageElement
  if (!img) return

  const frames = await loadFightFrames()
  if (frames.length === 0) {
    console.error('[fight] no frames, exiting')
    await invoke('pet_end_fight')
    return
  }

  // 预加载第一帧
  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = frames[0]
  })

  let idx = 0
  const interval = 1000 / FPS

  const timer = setInterval(() => {
    idx++
    if (idx >= frames.length) {
      clearInterval(timer)
      // 播完，通知后端关闭
      invoke('pet_end_fight').catch(() => {})
      return
    }
    img.src = frames[idx]
  }, interval)
}

main()
