// Middleware!
const bodyParser = require("body-parser");
const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const morgan = require("morgan");

// Load the dotfiles.
require("dotenv").load({ silent: true });

const port = process.env.PORT || 3000;
const database = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

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

const apiRouter = express.Router();
require("./app/server/routes/api")(apiRouter);

app.use("/api", apiRouter);

const authRouter = express.Router();
require("./app/server/routes/auth")(authRouter);

app.use("/auth", authRouter);

require("./app/server/routes")(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log(`App listening on port ${port}`);
