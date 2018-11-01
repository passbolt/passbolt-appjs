steal.config({
  main: 'passbolt',
  map: {
    "jquery/jquery": "jquery",
    "urijs": "node_modules/urijs/src"
  },
  paths: {
    "can": "node_modules/can/can.js",
    "can/*": "node_modules/can/*.js",
    "jquery": "node_modules/jquery/dist/jquery.js",
    "moment": "node_modules/moment/moment.js",
    "moment-timezone-with-data": "node_modules/moment-timezone/builds/moment-timezone-with-data.js",
    "sha1": "node_modules/jssha/src/sha.js",
    "underscore": "node_modules/underscore/underscore.js",
    "xregexp": "node_modules/xregexp/xregexp-all.js",
    "passbolt-mad": "node_modules/passbolt-mad/passbolt-mad.js",
    "passbolt-mad/*": "node_modules/passbolt-mad/*.js"
  },
  "meta": {
    "mocha": {
      "format": "global",
      "exports": "mocha",
      "deps": [
        "steal-mocha/add-dom"
      ]
    }
  },
  ext: {
    "ejs": "passbolt-mad/lib/can/viewEjsSystem"
  }
});
System.config({
  buildConfig: {
    map: {
      "can/util/util": "can/util/domless/domless"
    }
  }
});
