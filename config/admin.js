const bcrypt = require("bcrypt-nodejs");

const {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
} = process.env;

// Create a default admin user.
const User = require("../app/server/models/User");

// If there is already a user
User.findOne({ email: ADMIN_EMAIL }).exec((err, user) => {
    if (!user) {
        const u = new User();
        u.email = ADMIN_EMAIL;
        u.password = bcrypt.hashSync(ADMIN_PASSWORD, bcrypt.genSaltSync(10));
        u.admin = true;
        u.verified = true;
        u.save((err) => {
            if (err) {
                console.log(err);
            }
        });
    }
    else {
        // console.log(user, user.password);
        // user.remove(err => console.log(err, "removed"));
    }
});
