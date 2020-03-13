var Settings = require("sketch/settings");
let didTimeOut = false;

// 30 second timeout
export default function doRequest(options, fetchTimeout = 30000) {
  let url = Settings.settingForKey("ph-site").replace(/\/?$/, "/");
  let token = Settings.settingForKey("ph-token");

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
          "Request to " +
            url +
            " timed out. Please check to make sure your site is up and REST API Enpoint is publicly accessible."
        )
      );
    }, fetchTimeout);

    let payload = {
      headers: atts.headers,
      method: atts.method
    };

    if (Object.keys(atts.body).length > 0) {
      payload.body = atts.body;
    }

    fetch(url, payload)
      .then(function(response) {
        if (response.status !== 200 && response.status !== 201) {
          reject(
            "⚠️ Sketch received an invalid response from your server. " +
              response.status +
              ": " +
              response.statusText
          );
        }
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
              response.json().then(data => {
                if (
                  data.code &&
                  "rest_authentication_token_expired" === data.code
                ) {
                  clearTimeout(timeout);
                  refreshToken()
                    .then(response => {
                      console.log("refreshed");
                      // redo
                      return doRequest(options)
                        .then(response => {
                          resolve(response);
                        })
                        .catch(err => {
                          reject(err);
                        });
                    })
                    .catch(err => {
                      reject(err);
                    });
                } else if (data.message) {
                  reject(`⚠️ ` + data.message);
                } else {
                  reject(
                    "⚠️ Authentication credentials are incorrect. Please double check and try again."
                  );
                }
              });

              break;

            case 200:
            case 201:
              resolve(response);
              break;

            default:
              response.json().then(data => {
                if (data.message) {
                  reject(`⚠️ ` + data.message);
                } else {
                  reject(data);
                }
              });
              break;
          }
        }
      })
      .catch(function(err) {
        // Rejection already happened with setTimeout
        if (didTimeOut) return;
        // Reject with error
        reject(err);
      });
  });
}

export function refreshToken(options, timeout) {
  let siteUrl = Settings.settingForKey("ph-site").replace(/\/?$/, "/");

  return new Promise(function(resolve, reject) {
    // get refresh token
    let refresh = Settings.settingForKey("ph-refresh-token");

    // bail if we don't have one
    if (!refresh) {
      reject(
        "⚠️ Authentication credentials are incorrect. Please double check and try again."
      );
    }

    fetch(siteUrl + "/wp-json/projecthuddle/v2/token", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      method: "POST",
      body: {
        refresh_token: refresh
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        // store user data
        Settings.setSettingForKey("ph-token", data.access_token);
        Settings.setSettingForKey("ph-token-exp", data.exp);
        Settings.setSettingForKey("ph-refresh-token", data.refresh_token);
        Settings.setSettingForKey("ph-user", data.data.user);

        resolve(data);
      });
  });
}
