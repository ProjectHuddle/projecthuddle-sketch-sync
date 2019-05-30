import Sync from "../components/sync.js";

let args = {
  selected: 0,
  total: 0,
  projects: [],
  project: {},
  loading: true
};

var vm = new Vue({
  el: "#app",
  components: {
    Sync: Sync
  },
  data: args
});

window.setData = function(params) {
  if (params.selected) {
    args.selected = params.selected;
  }
  if (params.total) {
    args.total = params.total;
  }
  if (params.project) {
    args.project = params.project;
  }
  if (params.projects) {
    args.projects = params.projects;
  }
  if (typeof params.loading !== "undefined") {
    args.loading = params.loading;
  }
};
