const { dtsPlugin } = require('esbuild-plugin-d.ts');
const { build } = require('esbuild');

build({
    bundle: false,
    target: 'node16.0',
    platform: 'node',
    format: 'cjs',
    entryPoints: ['./src/index.ts', './src/persist.ts'],
    outdir: './dist/cjs',
    plugins: [
        dtsPlugin({
            outDir: './dist/types',
        }),
    ],
});
