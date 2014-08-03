'use strict';

module.exports = {
  register : function (plugin, options, next) {
    if (!options.namespace) next(new TypeError('namespace name required'));

    var cls = require('continuation-local-storage');
    var ns = cls.getNamespace(options.namespace);
    if (!ns) ns = cls.createNamespace(options.namespace);

    plugin.app.clsNamespace = ns;

    plugin.ext('onRequest', function (request, continuation) {
      ns.bindEmitter(request.raw.req);
      ns.bindEmitter(request.raw.res);

      ns.run(function () { continuation(); });
    });

    next();
  }
};

module.exports.register.attributes = {
  pkg: require('./package.json')
};
