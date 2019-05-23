// documentation: https://developer.sketchapp.com/reference/api/
var Settings = require("sketch/settings");
var sketch = require("sketch/dom");
var doc = context.document;

import exportArtboards from "./services/export-artboards";
import fetchImages from "./services/fetch-images";
import uploadAttachment from "./services/upload-attachments";
import createImage from "./services/create-image";
import updateImage from "./services/update-image";

import { confirmation } from "./utility/utility";

let project = Settings.settingForKey("ph-project");
let site = Settings.settingForKey("ph-site");
let artboards = [];

export default function() {
  confirmation({
    title: "Are you sure?",
    text:
      "This will sync the current sketch file with '" +
      project.title.rendered +
      "' on " +
      site +
      ".",
    confirmText: "Sync"
  }).then(startSync);
}

export function startSync() {
  // // save the document
  var document = context.document;
  log("context: " + context);
  log("Document name: " + document.name());

  // if (document.isDocumentEdited()) {
  //   confirmation({
  //     title: "Doc not saved.",
  //     text: "You must save before syncing",
  //     confirmText: "Save"
  //   });
  //   return;
  // }

  // get the artboards
  artboards = exportArtboards();
  return;

  // loop through artboards
  artboards.forEach(item => {
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
        response.json().then(data => {
          sketch.UI.message("Synced!");
        });
      });
  });
}

// upload attachment
// uploadAttachment(item.file)
//   .then(response => {
//     response.json().then(attachment => {
//       let syncData = {
//         body: {
//           title: item.artboard.name,
//           sketch_id: item.artboard.id,
//           featured_media: attachment.id,
//           parent_id: project.id,
//           options: {
//             background_color: item.artboard.background.color // sync background color
//           },
//           version: 1
//         }
//       };

//       // update if we already have one
//       if (data.length && data[0] && data[0].id) {
//         updateImage(data[0].id, syncData).then(() => {
//           sketch.UI.message("Synced!");
//         });
//         return;
//       }

//       // create if we
//       createImage(syncData).then(() => {
//         sketch.UI.message("Synced!");
//       });
//     });
//   })
//   .catch(err => {
//     console.log("error");
//     err.json().then(data => {
//       console.error(data);
//     });
//   });
//     });
//   });

// export function newAttachment(item, project) {
//   uploadAttachment(item.file)
//     .then(response => {
//       response.json().then(attachment => {
//         let syncData = {
//           body: {
//             title: item.artboard.name,
//             sketch_id: item.artboard.id,
//             featured_media: attachment.id,
//             parent_id: project.id,
//             options: {
//               background_color: item.artboard.background.color // sync background color
//             },
//             version: 1
//           }
//         };

//         // update if we already have one
//         if (data.length && data[0] && data[0].id) {
//           updateImage(data[0].id, syncData).then(() => {
//             sketch.UI.message("Synced!");
//           });
//           return;
//         }

//         // create if we
//         createImage(syncData).then(() => {
//           sketch.UI.message("Synced!");
//         });
//       });
//     })
//     .catch(err => {
//       console.log("error");
//       err.json().then(data => {
//         console.error(data);
//       });
//     });
// }
