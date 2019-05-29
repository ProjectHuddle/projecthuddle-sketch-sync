var sketch = require("sketch/dom");
var Settings = require("sketch/settings");

export default function() {
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
  let type = Settings.documentSettingForKey(context.document, "ph-artboards");
  if (type === "selected") {
    return selectedArtboards();
  } else {
    return pageArtboards();
  }
}

export function selectedArtboards() {
  var selectedArtboards = [];
  context.selection.forEach(function(selectedLayer) {
    if (
      selectedLayer.isMemberOfClass(MSArtboardGroup) ||
      selectedLayer.isMemberOfClass(MSSymbolMaster)
    ) {
      selectedArtboards.push(selectedLayer);
    }
  });
  return MSArtboardOrderSorting.sortArtboardsInDefaultOrder(selectedArtboards);
}

export function pageArtboards() {
  return MSArtboardOrderSorting.sortArtboardsInDefaultOrder(
    context.document.currentPage().artboards()
  );
}
