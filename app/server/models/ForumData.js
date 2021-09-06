var mongoose   = require('mongoose'),
    bcrypt     = require('bcrypt'),
    jwt        = require('jsonwebtoken');
    JWT_SECRET = process.env.JWT_SECRET;

var messageType = {
    message: "",
    time : Date.now(),
    user: "",
    visible : {
        type : String,
        enum : {
            values: 'all toSelf specific'.split(' '),
        }
    }
};

// define the schema for our admin model
var schema = new mongoose.Schema({
    forumType: {
        type: String,
        required: true,
        enum: {
            values: 'general mentor team'.split(' '),
        }
    },
    team: {
        type: String,
        required: true,
        min: 1,
        max: 100,
    },
    messages : {
        type : Array,
        required: true,
        default : []
    },
    lastMessage : {
        type : Number,
        required : true,
        default : 0
    },
});

schema.set('toJSON', {
    virtuals: true
});

schema.set('toObject', {
    virtuals: true
});

//=========================================
// Instance Methods
//=========================================

// checking if this the user allowed to see forum
schema.methods.addMessage = function(message){
    this.messages.set(this.lastMessage, message);
    this.lastMessage = this.messages.length;
};

schema.methods.isType = function(type) {
    return this.forumType === type;
};

schema.methods.isAllowed = function(team) {
    if ('general' === this.forumType) {
        return true;
    }
    else {
        return team === this.team;
    }
};

//=========================================
// Static Methods
//=========================================

// schema.statics.generateHash = function(password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
// };
//
// /**
//  * Verify an an email verification token.
//  * @param  {[type]}   token token
//  * @param  {Function} cb    args(err, email)
//  */
// schema.statics.verifyEmailVerificationToken = function(token, callback){
//     jwt.verify(token, JWT_SECRET, function(err, email) {
//         return callback(err, email);
//     });
// };
//
// /**
//  * Verify a temporary authentication token.
//  * @param  {[type]}   token    temporary auth token
//  * @param  {Function} callback args(err, id)
//  */
// schema.statics.verifyTempAuthToken = function(token, callback){
//     jwt.verify(token, JWT_SECRET, function(err, payload){
//
//         if (err || !payload){
//             return callback(err);
//         }
//
//         if (!payload.exp || Date.now() >= payload.exp * 1000){
//             return callback({
//                 message: 'Token has expired.'
//             });
//         }
//
//         return callback(null, payload.id);
//     });
// };
//
// schema.statics.findOneByEmail = function(email){
//     return this.findOne({
//         email: email.toLowerCase()
//     });
// };
//
// /**
//  * Get a single user using a signed token.
//  * @param  {String}   token    User's authentication token.
//  * @param  {Function} callback args(err, user)
//  */
// schema.statics.getByToken = function(token, callback){
//     jwt.verify(token, JWT_SECRET, function(err, id){
//         if (err) {
//             return callback(err);
//         }
//         this.findOne({_id: id}, callback);
//     }.bind(this));
// };
//
// schema.statics.validateProfile = function(profile, cb){
//     return cb(!(
//         profile.name.length > 0 &&
//         profile.adult &&
//         profile.school.length > 0 &&
//         ['2016', '2017', '2018', '2019'].indexOf(profile.graduationYear) > -1 &&
//         ['M', 'F', 'O', 'N'].indexOf(profile.gender) > -1
//     ));
// };

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
// schema.virtual('status.name').get(function(){
//
//     if (this.status.checkedIn) {
//         return 'checked in';
//     }
//
//     if (this.status.declined) {
//         return "declined";
//     }
//
//     if (this.status.confirmed) {
//         return "confirmed";
//     }
//
//     if (this.status.admitted) {
//         return "admitted";
//     }
//
//     if (this.status.completedProfile){
//         return "submitted";
//     }
//
//     if (!this.verified){
//         return "unverified";
//     }
//
//     return "incomplete";
//
// });
module.exports = mongoose.model('Forum', schema);
