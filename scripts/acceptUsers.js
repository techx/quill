require("dotenv").load();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const database = process.env.DATABASE || "mongodb://localhost:27017";

mongoose.connect(database);

const UserController = require("../app/server/controllers/UserController");

const user = { email: process.env.ADMIN_EMAIL };

const userArray = fs.readFileSync("accepted.txt").toString().split("\n");

let count = 0;
userArray.forEach((id) => {
    UserController.admitUser(id, user, () => {
        count += 1;
        if (count === userArray.length) {
            console.log("Done");
        }
    });
});
