var {google} = require('googleapis');
var fs = require('fs');
var stream = require('stream');

var file = {};

var CLIENT_EMAIL = process.env.CLIENT_EMAIL;
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var scopes = [
    'https://www.googleapis.com/auth/drive'
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

file.upload = function (id, metadata, file, callback) {
    var drive = google.drive('v3');

    // convert file to stream
    console.log(file);
    const imgBuffer = Buffer.from(file, 'base64')
    var s = new Readable()
    s.push(imgBuffer)

    // Promise to Create File
    var create = new Promise((resolve, reject) => {
        drive.files.create({
            requestBody: {
                name: metadata.name,
                mimeType: metadata.type
            },
            media: {
                mimeType: metadata.type,
                body: file
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

    // Request Permission if file is successfully created
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
        callback(err);
    });
};

module.exports = file;