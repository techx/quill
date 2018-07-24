// Connect to mongodb
const mongoose = require("mongoose");

const database = process.env.DATABASE || { url: "mongodb://localhost:27017" };
mongoose.connect(database.url);

const UserController = require("../app/server/controllers/UserController");

const users = 1000;
const username = "hacker";

for (var i = 0; i < users; i++) {
    console.log(username, i);
    UserController.createUser(`${username + i}@school.edu`, "foobar", () => {
        console.log(i);
    });
}
