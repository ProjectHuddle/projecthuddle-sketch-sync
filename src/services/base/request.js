var Settings = require("sketch/settings");
let didTimeOut = false;

export default function(options, fetchTimeout = 5000) {
  let url = Settings.settingForKey("ph-site");
  let token = Settings.settingForKey("ph-token");
  url = url.replace(/\/?$/, "/");

  // defaults
  let atts = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    endpoint: "",
    body: {},
    method: "GET"
  };

  // extend
  if (options) {
    Object.keys(options).forEach(function(key) {
      atts[key] = options[key];
    });
  }

  // add token if set
  if (token) {
    atts.headers.Authorization = "Bearer " + token;
  }

  url = url + atts.endpoint;

  // add url params
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
    }, fetchTimeout);

    let payload = {
      headers: atts.headers,
      method: atts.method,
      body: atts.body
    };

    fetch(url, payload)
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
              response.json().then(data => {
                if (data.message) {
                  reject(`⚠️ ` + data.message);
                }
              });
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
