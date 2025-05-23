import { cpSync, rmSync } from 'fs';
import path from "path";

rmSync("./dist", { recursive: true, force: true });
cpSync("./static", "./dist", { recursive: true });

export default [
    {
        mode: 'development',
        devtool: 'eval-source-map',
        experiments: {
            outputModule: true,
            topLevelAwait: true,
        },
        entry: './client/index.js',
        output: {
            publicPath: "/",
            filename: 'index.js',
            path: path.resolve('./dist'),
        }
    }
];