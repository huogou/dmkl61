// src/pet-core/appConfig.ts —— 应用级前端配置（纯本地，无网络请求）
import { ref } from 'vue'

/**
 * 是否隐藏「新增小猫」与切换入口（单猫模式）。
 * 默认 true = 隐藏。
 */
export const hideAddCat = ref(false)

/**
 * 是否在动作库里显示「变换」高级参数（X/Y 偏移、缩放）。
 * 默认 false = 隐藏。
 */
export const showTransform = ref(false)
