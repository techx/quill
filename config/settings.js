var Settings = require('../app/server/models/Settings');

Settings
  .findOne({})
  .exec(function(err, settings){
    if (!settings){
      var settings = new Settings();
      settings.save();
    }
  });
