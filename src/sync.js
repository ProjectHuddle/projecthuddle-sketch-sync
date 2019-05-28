// documentation: https://developer.sketchapp.com/reference/api/
var Settings = require("sketch/settings");
import sketch from "sketch";
import syncArtboard from "./functions/syncArtboard";
import exportArtboards from "./services/export-artboards";
import fetchRequest from "./services/base/request";

import { confirmation } from "./utility/utility";
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

  confirmation({
    title: "Are you sure?",
    text:
      "This will sync the current sketch file with '" +
      project.title.rendered +
      "' on " +
      site +
      ".",
    confirmText: "Sync"
  }).then(sync);
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

  // make sure project is retina
  sketch.UI.message("Preparing...");

  // Force project to retina images
  fetchRequest({
    endpoint: "/wp-json/projecthuddle/v2/mockup/" + project.id,
    method: "PATCH",
    body: {
      retina: true
    }
  });

  // get the artboards
  let artboards = exportArtboards();

  // start syncing
  sketch.UI.message("Syncing Artboards...");

  // sync each artboard
  artboards.forEach(syncArtboard);
}
