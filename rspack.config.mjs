import { defineConfig } from "@rspack/cli";
import { rspack } from "@rspack/core";

/** @type {Record<string, import('@rspack/core').ExternalItem>} */
const EXTERNALS = {
  "ok-simple": { winston: "commonjs winston" },
  "ok-callback": ({ request }, callback) => {
    callback(null, request === "windows" ? "commonjs winston" : undefined);
  },
  "ok-cb-w-cb-getResolve": ({ context, request, getResolve }, callback) => {
    getResolve()(context, request, (_err, result) => {
      callback(
        null,
        result?.includes("/node_modules/") ? `commonjs ${request}` : undefined
      );
    });
  },
  "ok-explicit-async": async ({ request }) =>
    request === "windows" ? "commonjs winston" : undefined,
  // Timeouts with "ERROR in × Error: channel closed"
  "ko-implicit-async": ({ request }) =>
    request === "windows" ? "commonjs winston" : undefined,
  // Seems to loose externalsPresets config
  "ko-explicit-async-w-async-getResolve": async ({
    context,
    request,
    getResolve,
  }) => {
    const result = await getResolve()(context, request);
    return result?.includes("/node_modules/")
      ? `commonjs ${request}`
      : undefined;
  },
  // Also seems to loose externalsPresets config
  "ko-explicit-async-w-cb-getResolve": async ({
    context,
    request,
    getResolve,
  }) => {
    const result = await new Promise((res, rej) =>
      getResolve()(context, request, (err, result) =>
        err ? rej(err) : res(result)
      )
    );
    return result?.includes("/node_modules/")
      ? `commonjs ${request}`
      : undefined;
  },
};

export default defineConfig(() => {
  const externals =
    (process.env["EXTERNALS"] ?? "") in EXTERNALS
      ? process.env["EXTERNALS"]
      : "ok-simple";
  console.log("Using externals conf", externals);
  return {
    target: "node",
    entry: {
      main: "./src/index.js",
    },
    devtool: false,
    output: { filename: `${externals}.js` },
    module: {
      rules: [
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
                  target: "ES2022",
                },
              },
            },
          ],
        },
      ],
    },
    externalsPresets: { node: true },
    externals: EXTERNALS[externals],
    optimization: {
      minimizer: [new rspack.SwcJsMinimizerRspackPlugin()],
    },
  };
});
