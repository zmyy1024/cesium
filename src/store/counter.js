import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    viewer: null,
  }),
  actions: {
    initViewer(state, viewer) {
      state.viewer = viewer;
    },
  },
})
