import {defineConfig} from "rollup";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: 'sortable-esm.js'
    },
    plugins: [
        typescript({
            tsconfig: 'tsconfig.json'
        })
    ]
});