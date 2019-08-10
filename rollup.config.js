import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";

export default [
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "umd"
    },
    plugins: [
      terser({
        compress: true,
        ecma: 8,
        mangle: {
          keep_classnames: true
        }
      })
    ]
  },
  {
    input: "src/util-version.js",
    output: {
      file: "dist/util.js",
      format: "umd"
    },
    plugins: [
      terser({
        compress: true,
        ie8: true
      }),
      babel({
        exclude: "node_modules/**"
      })
    ]
  }
];
