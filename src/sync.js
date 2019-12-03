var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";
const sketch = require("sketch");
import fetchProjects from "./services/fetch-projects";
import syncProject from "./syncProject";
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

  // create new browserwindow
  const syncWindow = new BrowserWindow({
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
  syncWindow.loadURL(require("./views/project-select.html"));

  let selected = selectedArtboards();
  let total = pageArtboards();

  // load data and show
  syncWindow.once("ready-to-show", () => {
    let data = {
      selected: selected.length,
      total: total.length,
      project: project,
      projects: projects,
      loading: true
    };
    syncWindow.show();
    syncWindow.webContents.executeJavaScript(
      `setSyncData(${JSON.stringify(data)})`
    );

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
        syncWindow.webContents.executeJavaScript(
          `setSyncData(${JSON.stringify({
            projects: data,
            loading: false
          })})`
        );
      })
      .catch(e => {
        if (typeof e === "string") {
          sketch.UI.message(e);
        } else {
          syncWindow.webContents.executeJavaScript(
            `setSyncData(${JSON.stringify({
              loading: false
            })})`
          );
          syncWindow.close();
          sketch.UI.message(
            `⚠️ Could not connect to ` +
              Settings.settingForKey("ph-site") +
              `. Please contact support for help.`
          );
        }
        console.error(e);
      });
  });

  // allow it to close
  syncWindow.webContents.on("ph-sync-close", () => {
    syncWindow.close();
  });

  // view project
  syncWindow.webContents.on("ph-navigate", url => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
  });

  // sync action
  syncWindow.webContents.on("ph-sync", options => {
    // close window
    syncWindow.close();

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
