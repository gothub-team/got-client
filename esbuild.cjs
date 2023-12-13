const path = require('path');
const fs = require('fs');
const { build } = require('esbuild');
const { dtsPlugin } = require('esbuild-plugin-d.ts');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
        } else if (file.endsWith('.js') && !file.endsWith('.spec.js')) {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('.d.ts')) {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
}

const buildTs = async () => {
    const entryFiles = getAllFiles('./src');
    // compiled code
    await build({
        logLevel: 'info',
        bundle: false,
        target: 'node18.0',
        platform: 'node',
        format: 'cjs',
        entryPoints: entryFiles,
        outdir: './dist/cjs',
    });
    await build({
        logLevel: 'info',
        bundle: false,
        target: 'node18.0',
        platform: 'node',
        format: 'esm',
        entryPoints: entryFiles,
        outdir: './dist/module',
        plugins: [
            dtsPlugin({
                outDir: './dist/types', // do types only once
            }),
        ],
    });
};

const buildJs = async () => {
    const entryFiles = getAllFiles('./src');
    // compiled code
    await build({
        logLevel: 'info',
        bundle: false,
        target: 'node18.0',
        platform: 'node',
        format: 'cjs',
        entryPoints: entryFiles,
        outdir: './dist/cjs',
    });
    await build({
        logLevel: 'info',
        bundle: false,
        target: 'node18.0',
        platform: 'node',
        format: 'esm',
        entryPoints: entryFiles,
        outdir: './dist/module',
    });
};

module.exports = { buildTs, buildJs };
