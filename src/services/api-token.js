import sketch from "sketch";
var Settings = require("sketch/settings");

export default function() {
  const FETCH_TIMEOUT = 5000;
  let didTimeOut = false;

  sketch.UI.message("Connecting...");

  let username = Settings.settingForKey("ph-username");
  let password = Settings.settingForKey("ph-password");
  let url = Settings.settingForKey("ph-site");
  url = url.replace(/\/?$/, "/");

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
        Accept: "application/json"
      },
      method: "POST",
      body: { username: username, password: password }
    };

    fetch(url + "/wp-json/jwt-auth/v1/token", payload)
      .then(function(response) {
        // Clear the timeout as cleanup
        clearTimeout(timeout);
        if (!didTimeOut) {
          switch (response.status) {
            case 404:
              reject(
                "⚠️ Please make sure your ProjectHuddle plugin is active on " +
                  Settings.settingForKey("ph-site")
              );
              break;

            case 403:
              reject(
                "⚠️ Authentication credentials are incorrect. Please double check and try again."
              );
              break;

            case 200:
            case 201:
              resolve(response);
              break;

            default:
              reject(
                `⚠️ Could not connect to ` +
                  Settings.settingForKey("ph-site") +
                  `. Please contact support for help.`
              );
              break;
          }
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
