import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import del from "rollup-plugin-delete";

let plugins = [
    typescript({
        tsconfig: 'tsconfig.json'
    })
];

export default ({ configProd }) => {
    if (configProd) {
        plugins = [
            del({ targets: 'dist' }),
            ...plugins,
            terser()
        ]
    }
    return defineConfig({
        input: 'src/index.ts',
        output: {
            dir: 'dist',
            format: 'esm',
            entryFileNames: 'sortable-esm.js'
        },
        plugins,
        watch: {
            include: ["src/**/*.ts"],
            buildDelay: 2000
        }
    });
}