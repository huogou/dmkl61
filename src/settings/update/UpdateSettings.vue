<template>
  <div class="update-settings">
    <SettingsHeader title="关于" />

    <main class="update-settings__body">
      <!-- 三猫照片墙横幅 -->
      <div class="family-banner">
        <div class="family-banner__bg"></div>
        <div class="family-banner__inner">
          <div class="family-banner__text">
            <div class="family-banner__title">dmkl61</div>
            <div class="family-banner__version">桌宠 · v{{ current || '…' }}</div>
            <div class="family-banner__line">六一 · 大米 · 可乐，陪你每一天</div>
          </div>
          <img :src="catsFamilyUrl" class="family-banner__img" alt="六一、大米、可乐" />
        </div>
      </div>

      <!-- 三猫日常照片墙 -->
<el-card shadow="never" class="block">
  <template #header><span class="card-title">三猫日常</span></template>
  <div class="gallery">
    <div v-for="cat in cats" :key="cat.id" class="gallery-row">
      <div class="gallery-cat">
        <div class="gallery-cat__name">{{ cat.name }}</div>
        <div class="gallery-cat__age">{{ cat.age }}</div>
      </div>
      <div class="gallery-figs">
        <figure v-for="act in actionOrder" v-if="gallery[cat.id]?.[act]" :key="act" class="gallery-item">
          <img :src="gallery[cat.id][act]" :alt="actionLabels[act]" class="gallery-img" />
          <figcaption>{{ actionLabels[act] }}</figcaption>
        </figure>
      </div>
    </div>
  </div>
</el-card>

      <!-- 程序图标 -->
      <el-card shadow="never" class="block">
        <template #header>
          <span class="card-title">程序图标</span>
        </template>

        <div class="avatar-section">
          <div class="avatar-preview">
            <img
              :src="appIconUrl"
              class="avatar-img"
              alt="当前程序图标"
            />
            <div class="avatar-label">
              {{ hasCustomIcon ? '当前自定义程序图标' : '默认图标（未自定义）' }}
            </div>
          </div>

          <div class="avatar-actions">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="onFileSelected"
            />
            <el-button
              type="primary"
              :loading="uploading"
              @click="fileInput?.click()"
            >
              {{ uploading ? '上传中...' : '选择图片上传' }}
            </el-button>
            <el-button
              v-if="hasCustomIcon"
              type="danger"
              plain
              @click="onReset"
            >
              恢复默认
            </el-button>
          </div>

          <div class="avatar-tip">
            上传后直接设为任务栏 / 窗口 / 托盘程序图标。<br />
            每只猫自己的头像在「基础设置」里单独设置，互不影响。
          </div>
        </div>
      </el-card>

      <!-- 版本检查 -->
      <el-card shadow="never" class="block">
        <template #header>
          <span class="card-title">版本检查</span>
        </template>
        <div class="version-section">
          <el-button
            type="primary"
            :icon="primaryIcon"
            :loading="checking || downloading"
            :disabled="primaryDisabled"
            @click="onPrimaryAction"
          >
            {{ primaryText }}
          </el-button>
          <div v-if="downloading || progress > 0" class="version-progress">
            <el-progress
              :percentage="progress"
              :status="progress === 100 ? 'success' : undefined"
            />
          </div>
          <div v-if="hasUpdate && !downloadedPath" class="new-version-banner">
            检测到新版本：{{ latest }}
          </div>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import {
  Download,
  RefreshRight,
  Close,
} from '@element-plus/icons-vue'
import SettingsHeader from '../common/SettingsHeader.vue'
import { convertFileSrc } from '@tauri-apps/api/core'

// 三猫合影横幅（六一/大米/可乐），打包进静态资源。
const catsFamilyUrl = new URL('../../assets/cats-family.png', import.meta.url).href

// 三猫日常照片墙：批量加载 gallery 下所有动作帧。
const galleryModules = import.meta.glob('../../assets/gallery/**/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const gallery: Record<string, Record<string, string>> = {}
for (const [p, u] of Object.entries(galleryModules)) {
  const m = p.match(/gallery\/([^/]+)\/([^/]+)\.webp$/)
  if (!m) continue
  ;(gallery[m[1]] ||= {})[m[2]] = u
}
const actionLabels: Record<string, string> = { idle: '待机', sleep: '睡觉', walk: '走路', fly: '跳跃', follow: '跟随' }
const actionOrder = ['idle', 'sleep', 'walk', 'fly', 'follow']
const cats = [
  { id: 'liuyi', name: '六一', age: '7岁大哥' },
  { id: 'dami', name: '大米', age: '4岁妹妹' },
  { id: 'kele', name: '可乐', age: '4岁妹妹' },
]

// 默认图标（打包时静态资源）：未自定义时使用。
const defaultIconUrl = new URL('../../assets/icon.png', import.meta.url).href
/** 当前程序图标 URL：有自定义 app-icon.png 时读运行时文件，否则用默认。 */
const appIconUrl = ref(defaultIconUrl)
/** 是否有自定义程序图标（控制"恢复默认"按钮显隐）。 */
const hasCustomIcon = ref(false)

/** 从后端读当前 app-icon.png 路径，刷新预览。 */
async function refreshAppIcon() {
  try {
    const p = await invoke<string>('pet_app_icon_url')
    if (p) {
      appIconUrl.value = `${convertFileSrc(p)}?t=${Date.now()}`
      hasCustomIcon.value = true
    } else {
      appIconUrl.value = defaultIconUrl
      hasCustomIcon.value = false
    }
  } catch {
    // 静默：读不到就用默认
  }
}

// ── 程序图标上传 ─────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片不能超过 5MB')
    target.value = ''
    return
  }

  uploading.value = true
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      // 直接存为全局程序图标（app-icon.png），一步到位。
      await invoke('pet_save_icon', { data: reader.result as string })
      await refreshAppIcon()
      ElMessage.success('已设为程序图标')
    } catch (err) {
      ElMessage.error(`设置失败：${err}`)
    } finally {
      uploading.value = false
      target.value = ''
    }
  }
  reader.onerror = () => {
    ElMessage.error('读取文件失败')
    uploading.value = false
    target.value = ''
  }
  reader.readAsDataURL(file)
}

async function onReset() {
  try {
    await invoke('pet_reset_icon')
    await refreshAppIcon()
    ElMessage.success('已恢复默认图标')
  } catch (err) {
    ElMessage.error(`恢复失败：${err}`)
  }
}

// ── 版本检查 ──────────────────────────────────
interface CheckResult {
  hasUpdate: boolean
  current: string
  latest: string
  notes: string
}

interface LastCheckResult {
  result: CheckResult | null
  checkedAtMs: number | null
}

const current = ref('')
const latest = ref('')
const notes = ref('')
const hasUpdate = ref(false)
const checking = ref(false)
const downloading = ref(false)
const cancelling = ref(false)
const progress = ref(0)
const downloadedPath = ref('')
const currentDownloadId = ref(0)

const primaryText = computed(() => {
  if (downloadedPath.value) return '立即安装并重启'
  if (downloading.value) return '下载中...'
  if (checking.value) return '检查中...'
  if (hasUpdate.value) return `更新到 v${latest.value}`
  return '检查更新'
})

const primaryIcon = computed(() => {
  if (downloadedPath.value) return RefreshRight
  if (hasUpdate.value && !downloading.value && !checking.value) return Download
  if (!downloading.value && !checking.value) return RefreshRight
  return undefined
})

const primaryDisabled = computed(() => checking.value || downloading.value)

async function onPrimaryAction() {
  if (downloadedPath.value) {
    await onApply()
  } else if (hasUpdate.value) {
    await onDownload()
  } else {
    await onCheck()
  }
}

async function onCheck() {
  checking.value = true
  try {
    const r = await invoke<CheckResult>('pet_update_check')
    current.value = r.current
    latest.value = r.latest
    notes.value = r.notes
    hasUpdate.value = r.hasUpdate
    if (!r.hasUpdate) {
      ElMessage.success('已是最新版本')
    }
  } catch (e) {
    ElMessage.error(`检查失败：${e}`)
  } finally {
    checking.value = false
  }
}

async function loadCachedResult() {
  try {
    const r = await invoke<LastCheckResult>('pet_update_last_result')
    if (r.result) {
      latest.value = r.result.latest
      notes.value = r.result.notes
      hasUpdate.value = r.result.hasUpdate
    }
  } catch {
    // 静默
  }
}

interface DownloadResult {
  path: string
  downloadId: number
}

interface DownloadState {
  isDownloading: boolean
  downloadId: number
  progress: number
  downloadedPath: string
  latestVersion: string
}

async function onDownload() {
  downloading.value = true
  progress.value = 0
  currentDownloadId.value = 0
  try {
    const r = await invoke<DownloadResult>('pet_update_download')
    downloadedPath.value = r.path
    currentDownloadId.value = r.downloadId
    progress.value = 100
    ElMessage.success('下载完成，可安装重启')
  } catch (e) {
    const msg = String(e)
    if (msg.includes('取消')) {
      ElMessage.info('下载已取消')
    } else {
      ElMessage.error(`下载失败：${e}`)
    }
    progress.value = 0
    currentDownloadId.value = 0
  } finally {
    downloading.value = false
  }
}

async function onCancel() {
  cancelling.value = true
  try {
    await invoke('pet_update_cancel')
  } catch (e) {
    ElMessage.error(`取消失败：${e}`)
  } finally {
    cancelling.value = false
  }
}

async function onApply() {
  try {
    await invoke('pet_update_apply')
  } catch (e) {
    ElMessage.error(`安装失败：${e}`)
  }
}

let unlisten: UnlistenFn | undefined
let unlistenStart: UnlistenFn | undefined
let unlistenCompleted: UnlistenFn | undefined

async function restoreDownloadState() {
  try {
    const s = await invoke<DownloadState>('pet_update_status')
    downloading.value = s.isDownloading
    progress.value = s.progress
    downloadedPath.value = s.downloadedPath
    currentDownloadId.value = s.downloadId
    if (s.latestVersion && !latest.value) {
      latest.value = s.latestVersion
      hasUpdate.value = true
    }
  } catch {
    // 查询失败不影响主流程
  }
}

onMounted(async () => {
  try {
    current.value = await invoke<string>('pet_app_version')
  } catch {
    // 取本地版本理论上不会失败
  }
  // 读当前自定义程序图标（若有）刷新预览。
  await refreshAppIcon()
  await loadCachedResult()
  await restoreDownloadState()

  unlisten = await listen<{
    downloaded: number
    total: number
    downloadId: number
  }>('update://progress', (e) => {
    if (!downloading.value) return
    if (e.payload.downloadId !== currentDownloadId.value) return
    const { downloaded, total } = e.payload
    if (total > 0) progress.value = Math.floor((downloaded / total) * 100)
  })
  unlistenStart = await listen<{ downloadId: number }>(
    'update://started',
    (e) => {
      currentDownloadId.value = e.payload.downloadId
    },
  )
  unlistenCompleted = await listen<{ path: string }>(
    'update://completed',
    (e) => {
      downloading.value = false
      downloadedPath.value = e.payload.path
      progress.value = 100
      ElMessage.success('下载完成，可安装重启')
    },
  )
})

onUnmounted(() => {
  unlisten?.()
  unlistenStart?.()
  unlistenCompleted?.()
})
</script>

<style scoped lang="scss">
.update-settings {
  min-height: 100vh;
}

.update-settings__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.family-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 180px;
  box-shadow: 0 4px 16px rgba(230, 180, 120, 0.18);
}
.family-banner__bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #fff6e8 0%, #ffe8cc 55%, #ffd9b0 100%);
}
.family-banner__inner {
  position: relative; display: flex; align-items: flex-end; justify-content: space-between; padding: 20px 24px 0; gap: 12px;
}
.family-banner__text { padding-bottom: 20px; flex-shrink: 0; }
.family-banner__title { font-size: 26px; font-weight: 700; color: #6b4423; letter-spacing: 1px; }
.family-banner__version { margin-top: 4px; font-size: 13px; color: #a07848; }
.family-banner__line { margin-top: 10px; font-size: 13px; color: #8a6239; letter-spacing: 0.5px; }
.family-banner__img { height: 150px; width: auto; object-fit: contain; flex-shrink: 0; }

.gallery { display: flex; flex-direction: column; gap: 14px; }
.gallery-row { display: flex; align-items: center; gap: 14px; }
.gallery-cat { width: 64px; flex-shrink: 0; }
.gallery-cat__name { font-size: 15px; font-weight: 600; color: #4a3520; }
.gallery-cat__age { font-size: 11px; color: #a07848; margin-top: 2px; }
.gallery-figs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; }
.gallery-item { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.gallery-img { width: 88px; height: 88px; object-fit: contain; border-radius: 10px; background: #fff8ee; box-shadow: 0 2px 6px rgba(180,130,80,0.12); }
.gallery-item figcaption { font-size: 11px; color: #8a6239; }

.about-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.about-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.about-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.about-card__name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.about-card__version {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--el-border-color);
}

.avatar-img--default {
  opacity: 0.7;
}

.avatar-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.avatar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.avatar-tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  line-height: 1.6;
}

.hidden-input {
  display: none;
}

.version-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-progress {
  margin-top: 8px;
}

.new-version-banner {
  padding: 10px 14px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
}
</style>
