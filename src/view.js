var Settings = require("sketch/settings");

export default function() {
  let project = Settings.documentSettingForKey(context.document, "ph-project");
  // make sure a project is set to sync
  if (!project || !project.link) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(project.link));
}
