const path = require('path');

module.exports = {
  entry: {
    app: './passbolt.js'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.stache$/,
        use: {
          loader: 'can-stache-loader'
        }
      },
      {
        test: /\.(js|jsx)$/,
        // exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/react"],
        }
      }
    ]
  },
  // externals: {
  //   react: 'React',
  //   'react-dom': 'ReactDOM'
  // },
  resolve: { extensions: ["*", ".js", ".jsx", "stache"] },
  output: {
    path: path.resolve(__dirname, 'dist'),
    pathinfo: true,
    filename: '[name].js'
  }
};
