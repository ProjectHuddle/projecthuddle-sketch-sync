var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";
const sketch = require("sketch");

export default function() {
  let project = Settings.documentSettingForKey(context.document, "ph-project");
  // make sure a project is set to sync
  if (!project || !project.link) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  const options = {
    identifier: "test",
    width: 300,
    height: 350,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: "#fff",
    titleBarStyle: "hiddenInset"
  };

  const browserWindow = new BrowserWindow(options);

  browserWindow.loadURL(require("./views/project-select.html"));

  //   NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(project.link));
}
