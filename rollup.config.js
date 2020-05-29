import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/polyfill.ts",
    output: {
      file: "dist/polyfill.js",
      format: "umd",
    },
    plugins: [
      terser({
        compress: true,
      }),
      typescript(),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "umd",
    },
    plugins: [
      terser({
        compress: true,
      }),
      typescript(),
      babel({
        exclude: "node_modules/**",
      }),
    ],
  },
];
