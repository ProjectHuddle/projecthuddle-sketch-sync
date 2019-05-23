import sketch from "sketch";
var Settings = require("sketch/settings");

import fetchProjects from "./services/fetch-projects";

export default function() {
  // validate connection
  sketch.UI.message("Fetching Projects...");

  fetchProjects({
    params: {
      per_page: 100
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      Settings.setSettingForKey("ph-projects", data);
      projectDialog();
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

      setTimeout(function() {
        projectDialog();
      }, 500);

      console.error(e);
    });

  return;
}

export function projectDialog() {
  var alert = NSAlert.alloc().init();
  var iconImage = NSImage.alloc().initByReferencingFile(
    context.plugin.urlForResourceNamed("icon.png").path()
  );
  alert.setIcon(iconImage);

  // title
  alert.setMessageText("Select A Project To Sync");

  //buttons
  alert.addButtonWithTitle("Choose");
  alert.addButtonWithTitle("Cancel");

  // make alert
  var y = 75;
  var container = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, y));

  // project label
  y -= 32;
  var projectLabel = NSTextField.alloc().initWithFrame(
    NSMakeRect(0, y, 300, 23)
  );
  projectLabel.setBezeled(false);
  projectLabel.setDrawsBackground(false);
  projectLabel.setEditable(false);
  projectLabel.setSelectable(false);
  projectLabel.setStringValue("Project");
  container.addSubview(projectLabel);

  // get stored projects and selected project
  let projects = Settings.settingForKey("ph-projects");
  let selectedProject = Settings.documentSettingForKey(
    context.document,
    "ph-project"
  );

  // projects chooser dropdown
  y -= 23;
  var order = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0, y, 300, 23));
  order.setNeedsDisplay();
  var valueIndex = 0; // The index within the NSMenu referring to the export order

  var menu = NSMenu.alloc().init();
  var totalIndex = 0;

  projects.forEach(function(value) {
    var menuItem = NSMenuItem.alloc().initWithTitle_action_keyEquivalent(
      value.title.rendered,
      nil,
      ""
    );
    menuItem.setEnabled(true);
    menuItem.setRepresentedObject(value.id);

    // if is selected, save index
    if (selectedProject) {
      if (value.id == selectedProject.id) {
        valueIndex = totalIndex;
      }
    }

    menu.addItem(menuItem);
    totalIndex++;
  });

  menu.setAutoenablesItems(false);
  order.setMenu(menu);
  order.selectItemAtIndex(valueIndex);
  container.addSubview(order);

  alert.setAccessoryView(container);

  if (alert.runModal() === 1000) {
    // save project
    Settings.setDocumentSettingForKey(
      context.document,
      "ph-project",
      projects[order.indexOfSelectedItem()]
    );
  }
}
