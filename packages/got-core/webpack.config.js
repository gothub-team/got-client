const path = require('path');

const commonConfig = {
    // Mode can be 'development' or 'production'
    mode: 'production',

    // Entry file of your library
    entry: './src/index.js',
    // External dependencies that shouldn't be bundled
    externals: {
        ramda: 'ramda',
        'ramda-adjunct': 'ramda-adjunct',
        '@gothub-team/got-util': '@gothub-team/got-util',
    },

    // Module resolution
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime'],
                    },
                },
            },
        ],
    },

    // Source maps (optional, can be omitted for smaller bundle size)
    devtool: 'source-map',

    // Configure how modules are resolved
    resolve: {
        extensions: ['.js'],
    },
};

const cjsConfig = {
    ...commonConfig,
    // Output configuration
    output: {
        path: path.resolve(__dirname, 'dist/cjs'),
        filename: 'index.js',
        libraryTarget: 'commonjs',
        globalObject: 'this',
    },
};

const esmConfig = {
    ...commonConfig,
    // Output configuration
    output: {
        path: path.resolve(__dirname, 'dist/module'),
        filename: 'index.js',
        libraryTarget: 'module',
        globalObject: 'this',
    },
    experiments: {
        outputModule: true,
    },
};

module.exports = [cjsConfig, esmConfig];
