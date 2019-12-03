// documentation: https://developer.sketchapp.com/reference/api/
var Settings = require("sketch/settings");
import sketch from "sketch";
import syncArtboard from "./syncArtboard";
import exportArtboards from "./services/export-artboards";
import fetchRequest from "./services/base/request";
let site = Settings.settingForKey("ph-site");

export default function() {
  // get document project
  let project = Settings.documentSettingForKey(context.document, "ph-project");

  // make sure a project is set to sync
  if (!project || !project.id) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  // make sure site is set
  if (!site) {
    sketch.UI.alert(
      "Not configured!",
      "Please configure this plugin in your connection settings."
    );
    return;
  }

  sync();
}

export function sync() {
  // save the document
  sketch.UI.message("Saving document...");
  var document = context.document;
  var doc = sketch.fromNative(document);
  doc.save();
  // get document project
  let project = Settings.documentSettingForKey(context.document, "ph-project");

  // make sure a project is set to sync
  if (!project || !project.id) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  // Force project to retina images
  fetchRequest({
    endpoint: "/wp-json/projecthuddle/v2/mockup/" + project.id,
    method: "PATCH",
    body: {
      retina: true
    }
  }).catch(err => {
    console.error(err);
  });

  // get the artboards
  let artboards = exportArtboards();

  // sync each artboard
  return artboards.forEach(board => {
    syncArtboard(board, artboards.length);
  });
}
