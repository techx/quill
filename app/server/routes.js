const path = require('path');
var User = require('./models/User');

const indexLocation = path.resolve(__dirname, '../client/index.html');

module.exports = function(app) {
  // Application ------------------------------------------
  app.get('/', function(req, res){
    res.sendFile(indexLocation);
  });

  // Wildcard all other GET requests to the angular app
  app.get('*', function(req, res){
    res.sendFile(indexLocation);
  });
};
