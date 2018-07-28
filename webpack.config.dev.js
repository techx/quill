const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

// Assets
const Assets = require("./assets");

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, "app/client/entry.js"),
    output: {
        path: path.resolve(`${__dirname}/app/client/dist/`),
        filename: "js/app.js",
    },
    module: {
        rules: [
            {
                test: /src.*\.js$/,
                use: [
                    {
                        loader: "ng-annotate-loader",
                        options: {
                            add: true,
                        },
                    },
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader"],
                }),
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader", "less-loader"],
                }),
            },
            {
                test: /\.(ttf|eot|svg|png|otf|woff|woff2)?$/,
                loader: "ignore-loader",
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin(
            Assets.map(asset => ({
                from: path.resolve(__dirname, `./node_modules/${asset}`),
                to: path.resolve(__dirname, "./app/client/dist/plugins"),
            })),
        ),
        new ExtractTextPlugin({
            // Output for CSS
            filename: "css/site.css",
        }),
        // new webpack.ProvidePlugin({
        //     jQuery: "jquery",
        //     $: "jquery",
        //     jquery: "jquery",
        // }),
    ],
    optimization: {
        minimize: false,
    },
};
