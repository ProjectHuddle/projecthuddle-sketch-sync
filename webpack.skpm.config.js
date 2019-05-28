const VueLoaderPlugin = require("vue-loader/lib/plugin");
const path = require("path");

/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {boolean} isPluginCommand - whether the config is for a plugin command or a resource
 **/
module.exports = function(config, isPluginCommand) {
  /** you can change config here **/
  config.module.rules.unshift({
    test: /\.vue$/,
    include: path.resolve(__dirname) + "/src",
    loader: "vue-loader"
  });

  console.log(config.module.rules);

  config.plugins.push(
    // make sure to include the plugin!
    new VueLoaderPlugin()
  );
};
