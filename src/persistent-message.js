import sketch from "sketch";
let item = false;

export default function(message, clear = false) {
  clearInterval(item);
  if (clear) {
    sketch.UI.message(message);
    return;
  }
  item = setInterval(function() {
    sketch.UI.message(message);
  }, 2000);
}
