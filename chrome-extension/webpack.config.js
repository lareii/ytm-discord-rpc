const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const env = require('./scripts/env')

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    popup: path.join(__dirname, "src", "popup.js"),
    background: path.join(__dirname, "src", "background.js"),
    content: path.join(__dirname, "src", "content.js"),
  },
  output: {
    globalObject: "this",
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ["*", ".mjs", ".js", ".json", ".wasm"]
      .map((extension) => "." + extension)
      .concat([".jsx", ".js", ".css"]),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // clean the build folder
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "dist"),
          force: true,
          transform: function (content, path) {
            return Buffer.from(
              JSON.stringify(
                {
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString()),
                },
                null,
                "\t"
              )
            );
          },
        },
        {
          from: "src/background-wrapper.js",
          to: path.join(__dirname, "dist"),
        },
        {
          from: "src/pages",
          to: path.join(__dirname, "dist", "pages"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new WriteFilePlugin(),
  ],
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-source-map";
}

module.exports = options;
