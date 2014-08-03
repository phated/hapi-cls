var lab      = require('lab');
var describe = lab.experiment;
var it       = lab.test;
var before   = lab.before;
var expect   = lab.expect;

describe("hapi app state", function () {
  var server;

  it("should expose the namespace on the state", function (done) {
    var cls = require('continuation-local-storage');
    var ns = cls.createNamespace('hapi@test');

    ns.run(function () {
      ns.set('value', 42);

      var Server = require('hapi').Server;
      server = new Server('localhost', 8080);

      var hello = {
        handler : function (request) {
          var app = request.server.pack.app;
          expect(app.clsNamespace.name).equal('hapi@test');
          request.reply({value : app.clsNamespace.get('value')});
        }
      };

      server.route({
        method : 'GET',
        path : '/hello',
        config : hello
      });

      server.pack.register({
        plugin : require('..'),
        options : {namespace : ns.name}
      }, done);
    });

    server.inject({url : '/hello'}, function (res) {
      expect(res.payload).equal('{"value":42}');
      done();
    });
  });
});
