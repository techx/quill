var File = require('../services/file')

var FileController = {};


FileController.upload = function (metadata, file, callback) {
    File.upload(metadata, file, callback);
};

FileController.update = function (fileId, metadata, file, callback) {
    File.update(fileId, metadata, file, callback);
}

module.exports = FileController;