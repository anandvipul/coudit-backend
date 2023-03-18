let jwt = require("jsonwebtoken");
let Profile = require("../models/Profile");

module.exports = {
  authorize: async (req, res, next) => {
    let token = req.headers.authtoken;

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        next();
      } else {
        console.log(decoded);
        Profile.findOne({ email: decoded }).then((data) => {
          req.user = decoded;
          req.id = data._id;
          next();
        });
      }
    });
  },
};
