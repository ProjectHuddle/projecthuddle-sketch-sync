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
  template: `<Sync></Sync>`,
  data: args
});
