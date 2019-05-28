var Settings = require("sketch/settings");
import fetchRequest from "./base/request";

export default function() {
  let api_key = Settings.settingForKey("ph-api-key");
  let api_secret = Settings.settingForKey("ph-api-secret");

  // get token
  return fetchRequest({
    method: "POST",
    endpoint: "/wp-json/projecthuddle/v2/token",
    body: { api_key: api_key, api_secret: api_secret }
  });
}
