import { defineConfig } from "@rspack/cli";
import { HtmlRspackPlugin } from "@rspack/core";
import { ReactRefreshRspackPlugin } from "@rspack/plugin-react-refresh";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));
const isDevelopment = process.env.NODE_ENV !== "production";

export default defineConfig({
  context: rootDirectory,
  entry: "./src/main.tsx",
  mode: isDevelopment ? "development" : "production",
  output: {
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: ["...", ".ts", ".tsx"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/u,
        exclude: /node_modules/u,
        type: "javascript/auto",
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    development: isDevelopment,
                    refresh: isDevelopment,
                    runtime: "automatic",
                  },
                },
              },
            },
          },
        ],
      },
      {
        test: /\.css$/u,
        type: "css",
      },
    ],
  },
  plugins: [
    new HtmlRspackPlugin({
      template: "./index.html",
    }),
    ...(isDevelopment ? [new ReactRefreshRspackPlugin()] : []),
  ],
  performance: {
    hints: false,
  },
  devServer: {
    historyApiFallback: true,
    port: 3000,
  },
});
