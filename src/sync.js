var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";
const sketch = require("sketch");
import fetchProjects from "./services/fetch-projects";
import syncProject from "./functions/syncProject";
import { selectedArtboards, pageArtboards } from "./services/export-artboards";
import connection from "./connection";

export default function() {
  let token = Settings.settingForKey("ph-token");

  if (!token) {
    connection();
    return;
  }

  let project = Settings.documentSettingForKey(context.document, "ph-project");
  let projects = Settings.settingForKey("ph-projects");

  // start fetching right away
  fetchProjects({
    params: {
      per_page: 100
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      Settings.setSettingForKey("ph-projects", data);
      win.webContents.executeJavaScript(
        `setData(${JSON.stringify({
          projects: data,
          loading: false
        })})`
      );
    })
    .catch(e => {
      if (typeof e === "string") {
        sketch.UI.message(e);
      } else {
        win.webContents.executeJavaScript(
          `setData(${JSON.stringify({
            loading: false
          })})`
        );
        win.close();
        sketch.UI.message(
          `⚠️ Could not connect to ` +
            Settings.settingForKey("ph-site") +
            `. Please contact support for help.`
        );
      }

      console.error(e);
    });

  // create new browserwindow
  const win = new BrowserWindow({
    identifier: "ph-sync",
    width: 300,
    height: 355,
    resizable: false,
    show: false,
    parent: sketch.getSelectedDocument(),
    modal: true,
    // alwaysOnTop: true,
    backgroundColor: "#fff"
  });
  win.loadURL(require("./views/project-select.html"));

  let selected = selectedArtboards();
  let total = pageArtboards();
  // load data and show
  win.once("ready-to-show", () => {
    let data = {
      selected: selected.length,
      total: total.length,
      project: project,
      projects: projects
    };
    win.webContents.executeJavaScript(`setData(${JSON.stringify(data)})`);
    win.show();
  });

  // allow it to close
  win.webContents.on("ph-sync-close", () => {
    win.close();
  });

  // view project
  win.webContents.on("ph-navigate", url => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
  });

  // sync action
  win.webContents.on("ph-sync", options => {
    // close window
    win.close();

    // save project
    Settings.setDocumentSettingForKey(
      context.document,
      "ph-project",
      options.project
    );

    // save artboards setting
    Settings.setDocumentSettingForKey(
      context.document,
      "ph-artboards",
      options.artboards
    );

    syncProject();
  });
}
