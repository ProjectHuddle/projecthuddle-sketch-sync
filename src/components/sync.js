// sync component
export default Vue.component("sync", {
  data() {
    return {
      exportOption: "all",
      selectedProject: 0,
      selected: 0,
      total: 0,
      projects: [],
      project: {},
      loading: true
    };
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
          <div class="block text-gray-700 text-md font-bold mb-2">
              Sync {{ artboards }} Artboards
          </div>
      </div>
      <!-- Title -->

      <div class="w-full mb-4 px-8">
          <div class="w-full relative inline-block">
                <select
                    v-model="selectedProject"
                    class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none">
                    <option value="0" selected>
                    Select a Project...
                    </option>
                    <template v-if="projects.length">
                      <option v-for="project in projects" v-bind:value="project.id"
                      :selected="selectedProject === project.id"> 
                        {{ project && project.title && project.title.rendered ? project.title.rendered : 'Untitled Project' }} 
                      </option>
                    </template>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
          </div>
          <div v-if="loading" class="absolute bottom-0 right-0 left-0 flex justify-center items-center">
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
              class="w-full text-white font-bold py-2 px-4 mb-2 rounded focus:outline-none focus:shadow-outline"
              v-bind:class="{ 
                'bg-blue hover:shadow-md': canSync, 
                'bg-gray-400 cursor-not-allowed': !canSync
              }"
              type="button"
              :disabled="!canSync">
              <template v-if="artboards">
                Sync
              </template>
              <template v-else>
                No Artboards to Sync
              </template>
          </button>
      </div>
      <template>
        <hr class="mb-4 border-t border-solid border-gray-300">
        <div class="px-8 flex justify-between items-center">
          <div class="w-2/3 truncate">
            <div class="text-gray-500 text-xs">Project</div>
            <div class="text-gray-700 text-md font-bold truncate">
              {{ project && project.title && project.title.rendered ? project.title.rendered : 'Untitled Project'}}
            </div>
          </div>
          <div class="w-1/3 text-right">
            <button @click="navigate" class="bg-transparent text-gray-600 font-bold text-xs py-2 px-3 rounded border border-gray-500 focus:shadow-outline">
                View
            </button>
          </div>
        </div>
      </template>
  </div>
</div>
  `,

  computed: {
    artboards() {
      return this.exportOption === "all" ? this.total : this.selected;
    },
    canSync() {
      return this.artboards && this.selectedProject;
    }
  },

  mounted() {
    window.setSyncData = params => {
      this.selected =
        typeof params.selected !== "undefined"
          ? params.selected
          : this.selected;
      this.total =
        typeof params.total !== "undefined" ? params.total : this.total;
      this.project =
        typeof params.project !== "undefined" ? params.project : this.project;
      this.projects =
        typeof params.project !== "undefined" ? params.projects : this.projects;
      this.loading =
        typeof params.loading !== "undefined" ? params.loading : this.loading;
    };
  },

  watch: {
    project() {
      this.selectedProject = this.project && this.project.id;
    },
    selectedProject() {
      this.project =
        this.projects.length &&
        this.projects.find(x => x.id === this.selectedProject);
    }
  },

  methods: {
    close() {
      window.postMessage("ph-sync-close");
    },
    sync() {
      window.postMessage("ph-sync", {
        artboards: this.exportOption,
        project: this.project
      });
    },
    navigate() {
      window.postMessage("ph-navigate", this.project.link);
    }
  }
});
