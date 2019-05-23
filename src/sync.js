// documentation: https://developer.sketchapp.com/reference/api/
var Settings = require("sketch/settings");
import sketch from "sketch";

import exportArtboards from "./services/export-artboards";
import fetchImages from "./services/fetch-images";
import uploadAttachment from "./services/upload-attachments";
import createImage from "./services/create-image";
import updateImage from "./services/update-image";

import { confirmation } from "./utility/utility";

let project = Settings.documentSettingForKey(context.document, "ph-project");
let site = Settings.settingForKey("ph-site");
let artboards = [];
let synced = 0;

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
  // save the document
  sketch.UI.message("Saving document...");
  var document = context.document;
  var doc = sketch.fromNative(document);
  doc.save();

  // make sure project is retina
  sketch.UI.message("Preparing...");
  setProjectRetina();

  // get the artboards
  artboards = exportArtboards();

  sketch.UI.message("Syncing Artboards...");

  // sync each artboard
  artboards.forEach(syncArtboard);
}

export function syncArtboard(item) {
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

// force retina
export function setProjectRetina() {
  const FETCH_TIMEOUT = 5000;
  let didTimeOut = false;

  let url = Settings.settingForKey("ph-site");
  let token = Settings.settingForKey("ph-token");

  if (!url || !token) {
    sketch.UI.message("Please connect to a website to get projects...");
    return;
  }

  url =
    url.replace(/\/?$/, "/") + "/wp-json/projecthuddle/v2/mockup/" + project.id;

  return new Promise(function(resolve, reject) {
    const timeout = setTimeout(function() {
      didTimeOut = true;
      reject(
        new Error(
          "Request timed out. Please check to make sure your site is up and REST API Enpoint is publicly accessible."
        )
      );
    }, FETCH_TIMEOUT);

    let payload = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token
      },
      method: "PATCH",
      body: {
        retina: true
      }
    };

    fetch(url, payload)
      .then(function(response) {
        // Clear the timeout as cleanup
        clearTimeout(timeout);
        if (!didTimeOut) {
          console.log("updated response", response, payload);
          response.json().then(data => {
            console.log("updated ", data);
          });
          resolve(response);
        }
      })
      .catch(function(err) {
        console.log("fetch failed! ", err);
        // Rejection already happened with setTimeout
        if (didTimeOut) return;
        // Reject with error
        reject(err);
      });
  });
}
