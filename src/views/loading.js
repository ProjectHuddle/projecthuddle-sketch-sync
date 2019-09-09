import Loading from "../components/loading.js";

let args = {
  current: 0,
  total: 0
};

new Vue({
  el: "#app",
  components: {
    Loading: Loading
  },
  data: args
});

window.setSyncData = function(params) {
  if (params.current) {
    args.current = params.current;
  }
  if (params.total) {
    args.total = params.total;
  }
};
