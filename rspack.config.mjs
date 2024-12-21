import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";
// import CopyWebpackPlugin from "copy-webpack-plugin";

// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"];

export default defineConfig({
  entry: {
    main: "./src/index.js",
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: "asset",
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "ecmascript",
                },
              },
              env: { targets },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({ template: "./index.html" }),
    // This doesn't work
    new rspack.CopyRspackPlugin({
      patterns: [{ from: "**", context: "data", to: "rspack" }],
    }),
    // This neither doesn't work
    // new CopyWebpackPlugin({
    //   patterns: [{ from: "**", context: "data", to: "webpack" }],
    // }),
  ],
  optimization: {
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin(),
      new rspack.LightningCssMinimizerRspackPlugin({
        minimizerOptions: { targets },
      }),
    ],
  },
  experiments: {
    css: true,
  },
});
