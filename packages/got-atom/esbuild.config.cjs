const { dtsPlugin } = require('esbuild-plugin-d.ts');
const { build } = require('esbuild');

build({
    bundle: false,
    target: 'node16.0',
    platform: 'node',
    format: 'cjs',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/cjs/index.cjs',
    plugins: [
        dtsPlugin({
            outDir: './dist/types',
        }),
    ],
});
