const path = require('path');

module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist/min'),
        library: {
            type: 'commonjs',
        },
        filename: 'index.js',
        assetModuleFilename: '[name][ext]',
        publicPath: '',
    },
    mode: 'production',
    target: 'web',
    externals: {
        '@gothub-team/got-api': '@gothub-team/got-api',
        '@gothub-team/got-store': '@gothub-team/got-store',
        'react-redux': 'react-redux',
        'ramda': 'ramda',
        'ramda-adjunct': 'ramda-adjunct',
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [{
            test: /\.d\.ts$/,
            type: 'asset/resource',
        },
        {
            test: /\.js$/, // include .js files
            enforce: 'pre', // preload the jshint loader
            exclude: /node_modules/, // exclude any and all files in the node_modules folder
            include: __dirname,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [[
                        '@babel/preset-env',
                        {
                            targets: {
                                node: 'current',
                            },
                        },
                    ]],
                },
            }],
        }],
    },
};
