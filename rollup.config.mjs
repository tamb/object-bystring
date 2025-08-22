import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "umd",
        name: "byString",
        globals: {
          "object-bystring": "byString",
        },
      },
      {
        file: "dist/index.esm.js",
        format: "es",
      },
      {
        file: "dist/index.esm.min.js",
        format: "es",
        plugins: [
          terser({
            compress: true,
          }),
        ],
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationMap: true,
        outDir: "./dist",
        exclude: ["**/*.test.ts", "**/vitest.config.ts"],
      }),
    ],
  },
  {
    input: "src/original.ts",
    output: [
      {
        file: "dist/original.js",
        format: "umd",
        name: "byStringOriginal",
        globals: {
          "object-bystring": "byStringOriginal",
        },
      },
      {
        file: "dist/original.esm.js",
        format: "es",
      },
      {
        file: "dist/original.esm.min.js",
        format: "es",
        plugins: [
          terser({
            compress: true,
          }),
        ],
      },
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationMap: true,
        outDir: "./dist",
        exclude: ["**/*.test.ts", "**/vitest.config.ts"],
      }),
    ],
  },
];
