// Global initalised variables from 'context'
var selection, doc, plugin, app, iconImage;
function onSetUp(context) {
  print("setup");
  selection = context.selection;
  doc = context.document;
  plugin = context.plugin;
  app = NSApplication.sharedApplication();
  iconImage = NSImage.alloc().initByReferencingFile(
    plugin.urlForResourceNamed("Icons/icon.png").path()
  );
}
