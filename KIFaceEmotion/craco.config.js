// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Deaktiviere source-map-loader für face-api.js
      webpackConfig.module.rules.forEach(rule => {
        if (rule.loader && rule.loader.includes('source-map-loader')) {
          rule.exclude = /node_modules\/face-api\.js/;
        }
      });
      
      // Setze PUBLIC_URL für korrekte Pfade
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.output.publicPath = '/KI-FaceEmotion/';
      }
      
      return webpackConfig;
    }
  }
};
