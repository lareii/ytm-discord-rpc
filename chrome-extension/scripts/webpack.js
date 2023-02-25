process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const WebpackDevServer = require("webpack-dev-server"),
    webpack = require("webpack"),
    config = require("../webpack.config"),
    env = require("./env"),
    path = require("path");

const options = config.chromeExtension || {};
const excludeEntriesToHotReload = options.notHotReload || [];

for (const entryName in config.entry) {
  if (excludeEntriesToHotReload.indexOf(entryName) === -1) {
    config.entry[entryName] = [
      "webpack/hot/dev-server",
      "webpack-dev-server/client?hot=true&hostname=localhost&port=" + env.PORT,
    ].concat(config.entry[entryName]);
  }
}

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(
  config.plugins || []
);

delete config.chromeExtensionBoilerplate;

const compiler = webpack(config);

const server = new WebpackDevServer(
    {
        https: false,
        hot: false,
        client: false,
        port: env.PORT,
        host: "localhost",
        static: {
            directory: path.join(__dirname, "../dist"),
            watch: false,
        },
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        devMiddleware: {
            publicPath: `http://localhost:${env.PORT}`,
            writeToDisk: true,
        },
        allowedHosts: "all",
    },
    compiler
);

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept();
}

(async () => {
  await server.start();
})();
