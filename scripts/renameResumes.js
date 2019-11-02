require('dotenv').load();

var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
var jwt             = require('jsonwebtoken');
mongoose.connect(database);

var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');

var fs = require('fs');
var AWS = require('aws-sdk');
var util = require('util');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var s3 = new AWS.S3();
User
.find({})
.exec(function(err, ids) {
    ids.forEach(function(user) {
        if (user.status.completedProfile === true) {
            var id = user._id;
            var lastName = user.profile.lastName;
            var firstName = user.profile.firstName;

            var bucketName = process.env.BUCKET_NAME;
            var oldFormat = util.format('%s/resumes/%s.pdf', bucketName, id);
            var newFormat = util.format('formatted_resumes/%s, %s (%s).pdf', lastName, firstName, id)
            
            s3.copyObject({
                Bucket: bucketName,
                CopySource: oldFormat,
                Key: newFormat 
            })
            .promise()
            .then(
                console.log(util.format('%s %s resume successfully changed.', firstName, lastName))
            )
            .catch((e) => console.error(e));
        }
    });
});
/*
function uploadResume(file, fileName, callback) { var params = {
    Bucket: process.env.BUCKET_NAME,
    Key: util.format('resumes/%s', fileName),
    Body: file
  };
  s3.upload(params, function(err, res) {
    if (res) {
      callback(undefined, res);
    }
    if (err) {
      callback(err, undefined);
    }
  });
}*/
