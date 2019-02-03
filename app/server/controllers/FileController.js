var File = require('../services/file')

var FileController = {};


FileController.upload = function(id, metadata, file, callback){
    File.upload(id, metadata, file, callback);
};

module.exports = FileController;