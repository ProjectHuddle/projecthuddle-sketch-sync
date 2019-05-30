var Settings = require("sketch/settings");
import doSync from "./sync";
import doConnection from "./connection";

export default function() {
  // make sure site is set
  let site = Settings.settingForKey("ph-site");
  if (!site) {
    doConnection();
    return;
  }

  // make sure a project is set to sync
  let project = Settings.documentSettingForKey(context.document, "ph-project");
  if (!project || !project.link) {
    doSync();
    return;
  }

  // go to project
  NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(project.link));
}
