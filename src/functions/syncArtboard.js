import sketch from "sketch";
var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";

import uploadAttachment from "../services/upload-attachments";
import createImage from "../services/create-image";
import updateImage from "../services/update-image";
import fetchImages from "../services/fetch-images";

let synced = 0;

export default function(board, total) {
  let item = sketch.fromNative(board.artboard);

  if (!item || !item.id) {
    sketch.UI.alert(
      "Something went wrong!",
      "There was an error in trying to get an artboard id."
    );
    return;
  }

  // get project id
  let project = Settings.documentSettingForKey(context.document, "ph-project");

  // make sure a project is set to sync
  if (!project || !project.id) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  // create new browserwindow
  const win = new BrowserWindow({
    identifier: "ph-loading",
    width: 200,
    height: 40,
    resizable: false,
    y: 0,
    alwaysOnTop: true,
    show: false,
    resizable: false,
    frame: false,
    vibrancy: "ultra-dark"
  });
  win.loadURL(require("../views/loading.html"));

  // load data and show
  win.once("ready-to-show", () => {
    let data = {
      current: 0,
      total: total
    };
    win.webContents.executeJavaScript(`setData(${JSON.stringify(data)})`);
    win.show();
  });

  // allow it to close
  win.webContents.on("ph-loading-close", () => {
    win.close();
  });

  // find if there is an existing image
  fetchImages({
    params: {
      parent_id: project.id, // needs to be in the current project
      sketch_id: item.id // needs to have an artboard id saved
    }
  })
    // upload attachment
    .then(response => {
      return response.json().then(images => {
        return Promise.all([
          images,
          uploadAttachment(board.file, {
            filename: item.name
          })
        ]);
      });
    })
    // sync or create image post
    .then(([images, attachmentResponse]) => {
      return attachmentResponse.json().then(attachment => {
        let image_id = false;
        if (images.length && images[0] && images[0].id) {
          image_id = images[0].id;
        }

        let syncData = {
          body: {
            title: item.name,
            sketch_id: item.id,
            featured_media: attachment.id,
            parent_id: project.id,
            options: {
              background_color: item.background.color // sync background color
            },
            version: 1
          }
        };

        // update if we already have one
        if (image_id) {
          return updateImage(image_id, syncData);
        }

        // create if we don't already have one
        return createImage(syncData);
      });
    })
    .then(response => {
      synced++;
      return response
        .json()
        .then(data => {
          if (total === synced) {
            sketch.UI.message("Synced!");
            win.close();
          } else {
            let data = {
              current: synced,
              total: total
            };
            win.webContents.executeJavaScript(
              `setData(${JSON.stringify(data)})`
            );
          }
        })
        .catch(err => {
          console.error(err);
          win.close();
        });
    })
    .catch(e => {
      if (typeof e === "string") {
        sketch.UI.message(e);
      } else {
        sketch.UI.message(
          `⚠️ Could not connect to ` +
            Settings.settingForKey("ph-site") +
            `. Please contact support for help.`
        );
      }
      win.close();

      console.error(e);
    });
}
