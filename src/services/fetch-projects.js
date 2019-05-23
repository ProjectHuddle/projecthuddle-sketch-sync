import sketch from "sketch";
var Settings = require("sketch/settings");

export default function(options) {
  const FETCH_TIMEOUT = 5000;
  let didTimeOut = false;

  sketch.UI.message("⇣ Fetching...");

  let url = Settings.settingForKey("ph-site");
  let token = Settings.settingForKey("ph-token");

  if (!url || !token) {
    sketch.UI.message("Please connect to a website to get projects...");
    return;
  }

  url = url.replace(/\/?$/, "/") + "/wp-json/projecthuddle/v2/mockup";

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

    let payload = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token
      },
      method: "GET"
    };

    fetch(url, payload)
      .then(function(response) {
        // Clear the timeout as cleanup
        clearTimeout(timeout);
        if (!didTimeOut) {
          console.log("Projects fetched! ", response);
          resolve(response);
        }
      })
      .catch(function(err) {
        console.log("Projects fetch failed! ", err);
        // Rejection already happened with setTimeout
        if (didTimeOut) return;
        // Reject with error
        reject(err);
      });
  });
}
