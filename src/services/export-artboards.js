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
      artboard: item,
      file: sketch.export(item, options)
    });
  });

  return details;
}

// get exportable artboards
export function exportableArtboards() {
  let type = Settings.documentSettingForKey(context.document, "ph-artboards");
  if (type === "selected") {
    return selectedArtboards();
  } else {
    return pageArtboards();
  }
}

// get selected artboards
export function selectedArtboards() {
  var selectedArtboards = [];
  var artboards = [];
  context.selection.forEach(function(selectedLayer) {
    if (
      selectedLayer.isMemberOfClass(MSArtboardGroup) ||
      selectedLayer.isMemberOfClass(MSSymbolMaster)
    ) {
      selectedArtboards.push(selectedLayer);
    }
  });
  var sortedPageArtboards = MSArtboardOrderSorting.sortArtboardsInDefaultOrder(
    selectedArtboards
  );

  // convert to plain array
  sortedPageArtboards.forEach(function(artboard) {
    artboards.push(artboard);
  });
  return artboards;
}

// get all artboard on current page
export function pageArtboards() {
  var artboards = [];
  var sortedPageArtboards = MSArtboardOrderSorting.sortArtboardsInDefaultOrder(
    context.document.currentPage().artboards()
  );
  // convert to plain array
  sortedPageArtboards.forEach(function(artboard) {
    artboards.push(artboard);
  });
  return artboards;
}
