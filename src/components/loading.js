// loading component
export default Vue.component("loading", {
  // passed props
  props: {
    total: 0,
    current: 0
  },

  template: `
    <div class="w-full flex justify-between items-center px-4">
        <div class="w-full bg-grey-500 py-4">
            <div class="bg-white py-1 rounded-full" style="transition: width 0.35s ease" v-bind:style="{ width: progress }"></div>
        </div>
        <!-- close button -->
        <div class="pl-2 cursor-pointer" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" class="text-gray-100">
                <path fill="currentColor" d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/>
            </svg>
        </div>
        <!-- close button -->
    </div>
`,

  computed: {
    progress() {
      if (this.current === 0 || this.total === 0) {
        return "10%";
      }
      return (this.current / this.total) * 100 + "%";
    }
  },
  methods: {
    close() {
      window.postMessage("ph-loading-close");
    }
  }
});
