import sketch from "sketch";
var Settings = require("sketch/settings");

export default function(attachment, options) {
  const FETCH_TIMEOUT = 30000; // 30 second timeout
  let didTimeOut = false;

  // sketch.UI.message("⤴️ Uploading attachment...");

  let url = Settings.settingForKey("ph-site");
  let token = Settings.settingForKey("ph-token");

  if (!url || !token) {
    sketch.UI.message("Please connect to a website...");
    return;
  }

  url = url.replace(/\/?$/, "/") + "/wp-json/projecthuddle/v2/media";

  if (options && options.params) {
    var esc = encodeURIComponent;
    var query = Object.keys(options.params)
      .map(k => esc(k) + "=" + esc(options.params[k]))
      .join("&");
    url += "?" + query;
  }

  return new Promise(function(resolve, reject) {
    const timeout = setTimeout(function() {
      didTimeOut = true;
      reject(
        new Error(
          "Request timed out. Please check to make sure your site is up and REST API Enpoint is publicly accessible."
        )
      );
    }, FETCH_TIMEOUT);

    let filename = "sketch-attachment";
    if (options && options.filename) {
      filename = options.filename;
    }

    let payload = {
      headers: {
        // "Content-type": "application/json",
        // "Content-Disposition": 'attachment; filename="test.png"',
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename=${filename}.png`,
        Authorization: "Bearer " + token
      },
      method: "POST",
      body: attachment
    };

    fetch(url, payload)
      .then(function(response) {
        // Clear the timeout as cleanup
        clearTimeout(timeout);
        if (!didTimeOut) {
          if (!response.ok) {
            response.json().then(data => {
              if (data && data.message) {
                sketch.UI.alert("Something went wrong!", data.message);
              }
              reject(response);
            });
          }
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
