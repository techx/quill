const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

// Assets
const Assets = require('./assets');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, "app/client/entry.js"),
    output: {
        path: __dirname + "/app/client/build/",
        filename: "app.js"
    },
    module: {
        rules: [
            {
                test: /src.*\.js$/,
                use: [
                    {
                        loader: 'ng-annotate-loader',
                        options: {
                            add: true
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            },
            {
                test:   /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:      ["css-loader"]
                })
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use:      ["css-loader", "less-loader"]
                })
            },
            {
                test: /\.(ttf|eot|svg|png|otf|woff|woff2)?$/,
                loader: 'ignore-loader'
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin(
            Assets.map(asset => {
                // Copy all vendor files and send them to the plugins directory
                return {
                    from: path.resolve(__dirname, `./node_modules/${asset}`),
                    to: path.resolve(__dirname, './app/client/plugins')
                };
            })
        ),
        new ExtractTextPlugin({
            // Output for CSS
            filename: "site.css"
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                discardComments: { 
                    removeAll: true 
                } 
            }
        })
    ],
    optimization: {
        minimize: true
    },
};
