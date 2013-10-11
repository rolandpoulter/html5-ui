var express = require('express');

var app = express();


serveFile('/mocha.js', '../node_modules/mocha/mocha.js');

serveFile('/mocha.css', '../node_modules/mocha/mocha.css');

serveFile('/chai.js', '../node_modules/chai/chai.js');

serveFile('/sinon.js', '../node_modules/sinon/pkg/sinon-1.7.3.js');

serveFile('/sinon-chai.js', '../node_modules/sinon-chai/lib/sinon-chai.js');


serveFile('/', 'static/index.html');

serveFile('/examples', 'static/examples.html');


app.configure(function () {

  app.use('/dist', express.static(__dirname + '/../dist/'));

  app.use(express.static(__dirname + '/static/'));

});


app.listen(9999, '127.0.0.1', function () {});


var path = require('path');


function serveFile (route, relative_file_path) {
  app.get(route, function (request, response) {
    response.sendfile(
    	path.join(__dirname, relative_file_path)
    );
  });
}
