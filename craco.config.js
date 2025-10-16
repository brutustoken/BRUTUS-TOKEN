const path = require("path");
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      // Encuentra la regla principal que usa Babel
      const oneOfRule = config.module.rules.find((rule) => Array.isArray(rule.oneOf));
      if (!oneOfRule) return config;

      // Busca el loader de babel
      const babelRule = oneOfRule.oneOf.find(
        (r) => r.loader && r.loader.includes("babel-loader")
      );

      if (babelRule) {
        // Forzamos a incluir librerías ESM problemáticas
        const extraIncludes = [
          path.resolve("node_modules/tronweb"),
          path.resolve("node_modules/@ledgerhq/hw-app-trx"),
          path.resolve("node_modules/@tronweb3/tronwallet-adapters"),
        ];

        if (Array.isArray(babelRule.include)) {
          babelRule.include = [...babelRule.include, ...extraIncludes];
        } else if (babelRule.include) {
          babelRule.include = [babelRule.include, ...extraIncludes];
        } else {
          babelRule.include = extraIncludes;
        }
      }

       config.resolve.fallback = {
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert/'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      return config;
    },
  },
  eslint: {
    enable: false, // 🔧 Evita el conflicto del plugin "react"
  },
};
