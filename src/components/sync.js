// sync component
export default Vue.component("sync", {
  data() {
    return {
      exportOption: "all",
      selectedProject: 0
    };
  },

  // passed props
  props: {
    project: {
      type: Object
    },
    projects: {
      type: Array
    },
    selected: 0,
    total: 0,
    loading: false
  },

  // template file
  template: `
  <div>
    <!-- close button -->
    <div class="absolute absolute top-0 right-0 p-6 cursor-pointer" @click="close">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" class="text-gray-700">
      <path fill="currentColor" d="M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/>
      </svg>
    </div>
    <!-- close button -->


    <div class="container py-8 mb-4 w-full max-w-xs">

      <!-- Title -->
      <div class="mb-4 px-8">
          <label class="block text-gray-700 text-md font-bold mb-2" for="username">
              Sync {{ artboards }} Artboards
          </label>
      </div>
      <!-- Title -->

      <div class="w-full mb-4 px-8">
          <div class="w-full relative inline-block">
                <select
                    v-model="selectedProject"
                    class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option v-for="project in projects" v-bind:value="project.id">
                      {{ project.title.rendered }}
                    </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
          </div>
          <div v-if="loading">
            <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
          </div>
      </div>
      <div class="mb-4 px-8">
          <label class="block text-gray-700 font-bold">
              <input class="mr-2 leading-tight" type="radio" name="artboards" value="all" v-model="exportOption">
              <span class="text-sm">
                  All Arboards On Page
              </span>
          </label>
          <label class="block text-gray-700 font-bold">
              <input class="mr-2 leading-tight" type="radio" name="artboards" value="selected" v-model="exportOption">
              <span class="text-sm">
                  Only Selected Artboards
              </span>
          </label>
      </div>
      <div class="mb-4 px-8">
          <button
              @click="sync"
              class="bg-blue w-full hover:shadow-md text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button">
              Sync
          </button>
      </div>
      <template v-if="project && project.id">
        <hr class="mb-4 border-t border-solid border-gray-300">
        <div class="px-8">
            {{project.title.rendered}}
        </div>
      </template>
  </div>
</div>
  `,

  mounted() {
    console.log(this.projects);
  },

  computed: {
    artboards(old, newVal) {
      return this.exportOption === "all" ? this.total : this.selected;
    }
  },

  methods: {
    close() {
      window.postMessage("ph-sync-close");
    },
    sync() {
      window.postMessage("ph-sync", {
        artboards: this.exportOption,
        project: 0
      });
    }
  }
});
