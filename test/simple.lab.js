var lab      = require('lab');
var describe = lab.experiment;
var it       = lab.test;
var before   = lab.before;
var expect   = lab.expect;

describe("basic hapi CLS case", function () {
  var server;

  before(function (done) {
    var cls = require('continuation-local-storage');
    var ns = cls.createNamespace('hapi@test');

    ns.run(function () {
      ns.set('value', 42);

      var Server = require('hapi').Server;
      server = new Server('localhost', 8080);

      var hello = {
        handler : function (request, reply) {
          ns.set('value', 'overwritten');
          setTimeout(function () {
            reply({value : ns.get('value')});
          });
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
  });

  it("should still find CLS context on subsequent ticks", function (done) {
    expect(process.namespaces['hapi@test']).to.be.ok;
    server.inject({url : '/hello'}, function (res) {
      expect(res.payload).equal('{"value":"overwritten"}');
      done();
    });
  });
});
