import sketch from "sketch";
var Settings = require("sketch/settings");
import BrowserWindow from "sketch-module-web-view";

import uploadAttachment from "./services/upload-attachments";
import createImage from "./services/create-image";
import updateImage from "./services/update-image";
import fetchImages from "./services/fetch-images";
import phMessage from "./persistent-message";

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

  phMessage("Syncing 1 of " + total + "...");

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
          return updateImage(image_id, syncData).catch(err => {
            console.log(err);
          });
        }

        // create if we don't already have one
        return createImage(syncData).catch(err => {
          console.log(err);
        });
      });
    })
    .then(response => {
      console.log(response);
      synced++;
      return response
        .json()
        .then(data => {
          if (total === synced) {
            phMessage("Synced!", true);
          } else {
            phMessage("Syncing " + (synced + 1) + " of " + total + "...");
          }
        })
        .catch(err => {
          console.error(err);
          if (typeof e === "string") {
            phMessage(err, true);
          } else {
            phMessage("Something went wrong.", true);
          }
        });
    })
    .catch(e => {
      if (typeof e === "string") {
        phMessage(e, true);
      } else {
        phMessage(
          `⚠️ Could not connect to ` +
            Settings.settingForKey("ph-site") +
            `. Please contact support for help.`,
          true
        );
      }
      console.error(e);
    });
}
