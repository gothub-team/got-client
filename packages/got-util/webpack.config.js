const path = require('path');
const fs = require('fs');

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
            arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
        } else if (file.endsWith('.js') && !file.endsWith('.spec.js')) {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles;
}

// Generate entry object dynamically
const srcDir = './src';
const entryFiles = getAllFiles(srcDir).reduce((acc, filePath) => {
    const entryKey = filePath.replace(`${srcDir}/`, '').replace('.js', '');
    acc[entryKey] = `./${filePath}`;
    return acc;
}, {});

console.log(entryFiles);

const commonConfig = {
    // Mode can be 'development' or 'production'
    mode: 'production',

    // Entry file of your library
    entry: entryFiles,
    // External dependencies that shouldn't be bundled
    externals: {
        ramda: 'ramda',
        'ramda-adjunct': 'ramda-adjunct',
    },

    optimization: {
        minimize: false, // Disables minification
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
