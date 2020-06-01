import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "src/polyfill.js",
    output: {
      file: "dist/polyfill.js",
      format: "umd",
    },
    plugins: [
      terser({
        compress: true,
      }),
      babel({
        exclude: "node_modules/**",
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "byString",
      globals: {
        "object-bystring": "byString",
      },
    },
    plugins: [
      terser({
        compress: true,
      }),
      babel({
        exclude: "node_modules/**",
      }),
      typescript(),
    ],
  },
];
