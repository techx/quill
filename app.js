// Middleware!
const bodyParser = require("body-parser");
const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");

// Load the dotfiles.
require("dotenv").load({ silent: true });

const port = process.env.PORT || 3000;
const database = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017/bigredhacks";

// Check for required variables before initializing
const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    EMAIL_ADDRESS,
    EMAIL_CONTACT,
    NODE_ENV,
    ROOT_URL,
    JWT_SECRET,
} = process.env;

const checkVariables = [
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    EMAIL_ADDRESS,
    EMAIL_CONTACT,
    NODE_ENV,
    ROOT_URL,
    JWT_SECRET,
];

const allVariablesDefined = checkVariables.filter(curVariable => typeof curVariable === "undefined");
if (allVariablesDefined.length > 0) {
    throw new Error(`Please make sure you have specified the following environment variables: ${allVariablesDefined.join(", ")}`);
}

const settingsConfig = require("./config/settings");
const adminConfig = require("./config/admin");

const app = express();

// Connect to mongodb
mongoose.connect(database);

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());

app.use(methodOverride());

app.use(express.static(`${__dirname}/app/client`));

// Routers =====================================================================

// API Router
const apiRouter = express.Router();
require("./app/server/routes/api")(apiRouter);

app.use("/api", apiRouter);

// Auth Router
const authRouter = express.Router();
require("./app/server/routes/auth")(authRouter);

app.use("/auth", authRouter);

require("./app/server/routes")(app);

// listen (start app with node server.js) ======================================
app.listen(port, (err) => {
    console.log(`App listening on port ${port}`);
});
