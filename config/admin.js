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
        u.password = ADMIN_PASSWORD;
        u.admin = true;
        u.verified = true;
        u.save((err) => {
            if (err) {
                console.log(err);
            }
        });
    }
});
