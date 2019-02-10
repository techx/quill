var {google} = require('googleapis');
var {Readable} = require('stream');

var file = {};

var CLIENT_EMAIL = process.env.CLIENT_EMAIL;
var PRIVATE_KEY = (process.env.NODE_ENV === 'production') ? JSON.parse(process.env.PRIVATE_KEY) : process.env.PRIVATE_KEY;
var scopes = [
    'https://www.googleapis.com/auth/drive.file'
];

// set auth as a global default
const jwtClient = new google.auth.JWT(
    CLIENT_EMAIL,
    null,
    PRIVATE_KEY,
    scopes);

google.options({
    auth: jwtClient
});

file.upload = function (metadata, file, callback) {
    var drive = google.drive('v3');

    // Parse base64 out of dataURL,
    // then push into buffer which is read by a stream
    var buffer = Buffer.from(file.split(",")[1], 'base64');
    var fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    // Promise to Create File
    var create = new Promise((resolve, reject) => {
        drive.files.create({
            requestBody: {
                name: metadata.name,
                mimeType: metadata.type
            },
            media: {
                mimeType: metadata.type,
                body: fileStream
            },
            fields: 'id, name, webViewLink'
        }, (err, response) => {
            if(err){
                reject(err);
            } else {
                resolve(response.data);
            }
        });
    });

    // Request Permission to be publicly viewable if file is successfully created
    create.then((fileData) => {
        drive.permissions.create({
            fileId: fileData.id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        }, (err, data) => {
            if(err){
                console.log(err);
                callback(err);
            }else{
                callback(null, fileData);
            }
        })
    }, (err) => {
        console.log(err);
        callback(err);
    });
};

file.update = function(fileId, metadata, file, callback){
    var drive = google.drive('v3');

    // Parse base64 out of dataURL,
    // then push into buffer which is read by a stream
    var buffer = Buffer.from(file.split(",")[1], 'base64');
    var fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    drive.files.update({
        fileId: fileId,
        requestBody: {
            name: metadata.name,
            mimeType: metadata.type
        },
        media: {
            mimeType: metadata.type,
            body: fileStream
        },
        fields: 'id, name, webViewLink'
    }, (err, response) => {
        if(err){
            callback(err);
        } else {
            callback(null, response.data);
        }
    });
};

module.exports = file;
