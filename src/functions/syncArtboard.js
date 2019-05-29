import sketch from "sketch";
var Settings = require("sketch/settings");

import uploadAttachment from "../services/upload-attachments";
import createImage from "../services/create-image";
import updateImage from "../services/update-image";
let synced = 0;

export default function(item) {
  // get project id
  let project = Settings.documentSettingForKey(context.document, "ph-project");

  // make sure a project is set to sync
  if (!project || !project.id) {
    sketch.UI.alert("No Project Set!", "Please select a project to sync.");
    return;
  }

  if (!item || !item.artboard || !item.arboard.id) {
    sketch.UI.alert(
      "No artboards to sync!",
      "Please create an artboard to sync."
    );
    return;
  }

  sketch.UI.message("fetching");

  // find if there is an existing image
  fetchImages({
    params: {
      parent_id: project.id, // needs to be in the current project
      sketch_id: item.artboard.id // needs to have an artboard id saved
    }
  })
    // upload attachment
    .then(response => {
      return response.json().then(images => {
        return Promise.all([
          images,
          uploadAttachment(item.file, {
            filename: item.artboard.name
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
            title: item.artboard.name,
            sketch_id: item.artboard.id,
            featured_media: attachment.id,
            parent_id: project.id,
            options: {
              background_color: item.artboard.background.color // sync background color
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
          if (artboards.length === synced) {
            sketch.UI.message("All synced!");
          } else {
            sketch.UI.message(synced + " of " + artboards.length + " synced!");
          }
        })
        .catch(err => {
          console.error(err);
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

      console.error(e);
    });
}
