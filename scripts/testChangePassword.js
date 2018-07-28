require("dotenv").load();
const mongoose = require("mongoose");

const database = process.env.DATABASE || { url: "mongodb://localhost:27017" };
const jwt = require("jsonwebtoken");

mongoose.connect(database.url);

const User = require("../app/server/models/User");
const UserController = require("../app/server/controllers/UserController");

const email = "hacker@school.edu";

User.findOne({
    email,
}, (err, user) => {
    const id = user._id;

    /* Change with old password */
    UserController.changePassword(
        id,
        "foobar",
        "testpassword",
        (err, something) => {
            console.log(!err ? "Successfuly changed" : err);
        },
    );

    /* Change with auth token */
    // var token = user.generateTempAuthToken();

    // UserController.resetPassword(
    //   id,
    //   token,
    //   'hunter123',
    //   function (err, something){
    //     console.log(!err ? 'Successfully changed' : err);
    //   }
    // );
});
