<template>
  <div
    v-if="visible"
    class="hud-box"
    :style="{
      opacity,
      [position]: '40px',
      top: '10%'
    }"
  >
    <div class="hud-title">{{ title }}</div>
    <div class="table-scroll" :style="{ maxHeight }">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in data" :key="i">
            <td v-for="(col, j) in columns" :key="j">{{ row[col] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  columns: {
    type: Array,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  },
  opacity: {
    type: Number,
    default: 1
  },
  visible: {
    type: Boolean,
    default: true
  },
  left: Boolean,
  right: Boolean,
  maxHeight: {
    type: String,
    default: '300px'
  }
});

const position = computed(() => {
  if (props.left) return 'left';
  if (props.right) return 'right';
  return 'left';
});
</script>

<style scoped>
.hud-box {
    z-index: 99;
  position: absolute;
  background-color: rgba(0, 20, 40, 0.6);
  border: 2px solid #00ffff88;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
  color: #00ffff;
  min-width: 200px;
}

.hud-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  text-shadow: 0 0 4px #00ffff;
}

.table-scroll {
  overflow-y: auto;
  max-width: 100%;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #00ffff;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 6px 8px;
  text-align: center;
}

.data-table tbody tr:nth-child(odd) {
  background-color: rgba(0, 255, 255, 0.05);
}

.data-table tbody tr:hover {
  background-color: rgba(0, 255, 255, 0.1);
}
</style>
