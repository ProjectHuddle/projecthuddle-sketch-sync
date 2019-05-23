export function confirmation(options) {
  return new Promise(function(resolve, reject) {
    var alert = NSAlert.alloc().init();
    var iconImage = NSImage.alloc().initByReferencingFile(
      context.plugin.urlForResourceNamed("icon.png").path()
    );
    alert.setIcon(iconImage);

    // title
    alert.setMessageText(options.title || "Are you sure?");

    if (options.text) {
      alert.setInformativeText(options.text);
    }

    //buttons
    alert.addButtonWithTitle(options.confirmText || "Confirm");
    alert.addButtonWithTitle(options.cancelText || "Cancel");

    if (alert.runModal() === 1000) {
      resolve();
    }
  });
}
