<template>
  <div class="menu" @mousedown.stop>
    <button
      v-for="(item, i) in menuItems"
      :key="i"
      class="menu__btn"
      :class="{ 'menu__btn--active': item.active }"
      :style="{ animationDelay: `${i * 40}ms` }"
      @click.stop="onSelect(item.actionId)"
    >
      <span class="menu__btn-text">{{ item.label }}</span>
    </button>
  </div>
</template>

<script lang="ts">
const MENU_BASE_WIDTH = 120
const MENU_BASE_HEIGHT = 210

export { MENU_BASE_WIDTH, MENU_BASE_HEIGHT }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { PAW_SLOTS, type MenuItemConfig } from '../../../pet-core/menuSettings'

const props = defineProps<{
  items: MenuItemConfig[]
}>()

const follow = defineModel<boolean>('follow', { required: true })
const passthrough = defineModel<boolean>('passthrough', { required: true })

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', actionId: string): void
}>()

const menuItems = computed(() =>
  PAW_SLOTS.map((slot, i) => {
    const item = props.items[i]
    const active =
      (item.actionId === 'toggleFollow' && follow.value) ||
      (item.actionId === 'togglePassthrough' && passthrough.value)
    return {
      label: item.label,
      actionId: item.actionId,
      active,
    }
  }),
)

function onSelect(actionId: string) {
  emit('select', actionId)
  emit('close')
}
</script>

<style scoped>
.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  user-select: none;
  font-family: -apple-system, 'Microsoft YaHei', 'Segoe UI', sans-serif;
  width: 120px;
}

.menu__btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: background 0.12s, color 0.12s;
  animation: menu-btn-in 0.2s ease both;
  white-space: nowrap;
}

.menu__btn:hover {
  background: #f1760b;
  color: #fff;
}

.menu__btn--active {
  background: #74aeff;
  color: #fff;
}

.menu__btn--active:hover {
  background: #5b9eea;
}

@keyframes menu-btn-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
