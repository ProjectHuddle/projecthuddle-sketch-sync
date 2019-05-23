var sketch = require("sketch/dom");

export default function() {
  let names = [];
  let options = {
    formats: "png",
    scales: "2", //2x scale
    "save-for-web": true,
    overwriting: true,
    output: false
  };
  var artboards = exportableArtboards();

  // prepare an array of export objects
  // artboard and file
  var details = [];
  artboards.map(item => {
    details.push({
      artboard: sketch.fromNative(item),
      file: sketch.export(item, options)
    });
  });

  return details;
}

export function exportableArtboards() {
  var artboards = [];
  context.document.pages().forEach(function(page) {
    var sortedPageArtboards = MSArtboardOrderSorting.sortArtboardsInDefaultOrder(
      page.artboards()
    );
    sortedPageArtboards.forEach(function(artboard) {
      artboards.push(artboard);
    });
  });
  return artboards;
}
