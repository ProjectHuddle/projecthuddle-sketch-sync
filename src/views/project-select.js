import Sync from "../components/sync.js";

let args = {
  selected: 0,
  total: 0,
  //   projects: {},
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
  args.selected = params.selected || 0;
  args.total = params.total || 0;
  args.project = params.project || {};
  args.projects = params.projects || [];
};
