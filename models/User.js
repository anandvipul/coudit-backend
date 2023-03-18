let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.password && this.isModified("password")) {
    bcrypt
      .hash(this.password, 10)
      .then((hash) => {
        this.password = hash;
        next();
      })
      .catch((err) => {
        // console.log(err);
        next();
      });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = async function (password, cb) {
  bcrypt
    .compare(password, this.password)
    .then((result) => {
      console.log("Passed Verification");
      return cb(result);
    })
    .catch((err) => {
      console.log("Error: ", err);
      return false;
    });
};

userSchema.methods.signToken = async function () {
  let token = await jwt.sign(this.email, process.env.SECRET);
  return token;
};

module.exports = mongoose.model("User", userSchema);
