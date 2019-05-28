import sketch from "sketch";
var Settings = require("sketch/settings");
import get_api_token from "./services/api-token";

export default function(context) {
  var alert = NSAlert.alloc().init();
  var iconImage = NSImage.alloc().initByReferencingFile(
    context.plugin.urlForResourceNamed("icon.png").path()
  );
  alert.setIcon(iconImage);

  // title
  alert.setMessageText("Install Information");

  //buttons
  alert.addButtonWithTitle("Connect");
  alert.addButtonWithTitle("Cancel");

  // make alert
  var y = 250;
  var container = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, y));

  // site url label
  y -= 32;
  var websiteURLLabel = NSTextField.alloc().initWithFrame(
    NSMakeRect(0, y, 300, 23)
  );
  websiteURLLabel.setBezeled(false);
  websiteURLLabel.setDrawsBackground(false);
  websiteURLLabel.setEditable(false);
  websiteURLLabel.setSelectable(false);
  websiteURLLabel.setStringValue("The Website URL of your installation");
  container.addSubview(websiteURLLabel);

  // site url
  y -= 22;
  var websiteURL = NSTextField.alloc().initWithFrame(NSMakeRect(0, y, 300, 23));
  websiteURL.setBezeled(true);
  websiteURL.setDrawsBackground(true);
  websiteURL.setEditable(true);
  websiteURL.setSelectable(true);
  let websiteURLVal = Settings.settingForKey("ph-site") || "https://";
  websiteURL.setStringValue(websiteURLVal);
  container.addSubview(websiteURL);

  // username label
  y -= 45;
  var usernameLabel = NSTextField.alloc().initWithFrame(
    NSMakeRect(0, y, 300, 23)
  );
  usernameLabel.setBezeled(false);
  usernameLabel.setDrawsBackground(false);
  usernameLabel.setEditable(false);
  usernameLabel.setSelectable(false);
  usernameLabel.setStringValue("API Key");
  container.addSubview(usernameLabel);

  // username
  y -= 22;
  var username = NSTextField.alloc().initWithFrame(NSMakeRect(0, y, 300, 23));
  username.setBezeled(true);
  username.setDrawsBackground(true);
  username.setEditable(true);
  username.setSelectable(true);
  let usernameVal = Settings.settingForKey("ph-api-key") || "";
  username.setStringValue(usernameVal);
  container.addSubview(username);
  alert.setAccessoryView(container);

  // password label
  y -= 45;
  var passwordLabel = NSTextField.alloc().initWithFrame(
    NSMakeRect(0, y, 300, 23)
  );
  passwordLabel.setBezeled(false);
  passwordLabel.setDrawsBackground(false);
  passwordLabel.setEditable(false);
  passwordLabel.setSelectable(false);
  passwordLabel.setStringValue("API Secret");
  container.addSubview(passwordLabel);

  // password
  y -= 22;
  var password = NSSecureTextField.alloc().initWithFrame(
    NSMakeRect(0, y, 300, 23)
  );
  password.setBezeled(true);
  password.setDrawsBackground(true);
  password.setEditable(true);
  password.setSelectable(true);
  let passwordVal = Settings.settingForKey("ph-api-secret") || "";
  password.setStringValue(passwordVal);
  container.addSubview(password);
  alert.setAccessoryView(container);

  if (alert.runModal() === 1000) {
    Settings.setSettingForKey("ph-site", websiteURL.stringValue());
    Settings.setSettingForKey("ph-api-key", username.stringValue());
    Settings.setSettingForKey("ph-api-secret", password.stringValue());

    get_api_token()
      .then(response => {
        sketch.UI.message("🤟🏻Successfully connected!");
        response.json().then(data => {
          // store user data
          Settings.setSettingForKey("ph-token", data.access_token);
          Settings.setSettingForKey("ph-token-exp", data.exp);
          Settings.setSettingForKey("ph-refresh-token", data.refresh_token);
          Settings.setSettingForKey("ph-user", data.data.user);
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

    return true;
  }
  return false;
}
