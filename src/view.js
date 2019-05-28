var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";
const sketch = require("sketch");

export default function() {
  let project = Settings.documentSettingForKey(context.document, "ph-project");
  let projects = Settings.settingForKey("ph-projects");

  // make sure a project is set to sync
  if (!project || !project.link) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  const options = {
    identifier: "test",
    width: 300,
    height: 400,
    resizable: false,
    show: false,
    parent: sketch.getSelectedDocument(),
    modal: true,
    alwaysOnTop: true,
    backgroundColor: "#fff"
  };

  const win = new BrowserWindow(options);

  win.loadURL(require("./views/project-select.html"));

  win.once("ready-to-show", () => {
    win.show();

    let data = {
      selected: context.selection.length,
      total: context.document.currentPage().artboards().length,
      project: project,
      projects: projects
    };

    win.webContents.executeJavaScript(`setData(${JSON.stringify(data)})`);
  });

  // allow it to close
  win.webContents.on("ph-sync-close", () => {
    win.close();
  });

  win.webContents.on("ph-sync", options => {
    console.log(options);
    win.close();
  });

  //   NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(project.link));
}
