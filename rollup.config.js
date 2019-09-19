import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

export default [
  {
    input: "src/polyfill.js",
    output: {
      file: "dist/polyfill.js",
      format: "umd"
    },
    plugins: [
      terser({
        compress: true
      })
    ]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "umd"
    },
    plugins: [
      terser({
        compress: true
      }),
      babel({
        exclude: "node_modules/**"
      })
    ]
  }
];
