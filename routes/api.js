let router = require("express").Router();
const { LocalStorage } = require("node-localstorage");
let User = require("../models/User");
let Profile = require("../models/Profile");
let localStorage = require("node-localstorage").LocalStorage;
let auth = require("../middleware/auth");
let Mongoose = require("mongoose");
let Article = require("../models/Article");
let Comment = require("../models/Comment");

// Welcome To The API Portal
router.get("/", (req, res, next) => {
  res.json({ message: "Welcome to the api version: 1.0" });
});

// Welcome to the Registration
router.post("/users", (req, res, next) => {
  User.create(req.body).then((doc) => {
    if (doc !== null) {
      console.log(doc);
      Profile.create({
        email: req.body.email,
        username: req.body.username,
      }).then((doc) => {
        if (doc !== null) {
          console.log(doc);
          res.json({ message: "SuccessFully Registerd" });
        }
      });
    }
  });
});

// Welcome to the Login
router.post("/users/login", (req, res, next) => {
  let { email, password } = req.body;
  User.findOne({ email }).then(async (doc) => {
    if (doc !== null) {
      await doc.verifyPassword(password, async (result) => {
        if (result) {
          console.log("Final Result", result);
          let token = await doc.signToken();

          res.json({
            message: "Authenticated Successfully",
            token: token,
          });
        } else {
          res.json({ message: "Bad Request/Incorrect Password" });
        }
      });
    } else {
      res.json({ Error: "User DOnt Exist" });
    }
  });
});

router.get("/dummy", auth.authorize, (req, res, next) => {
  res.json({ message: "Welcome to VIP Zone" });
});

// Get Logged in User Info
router.get("/user", auth.authorize, (req, res, next) => {
  let email = req.user;
  Profile.findOne({ email: email }).then((data) => {
    res.json(data);
  });
});

// Update a User
router.put("/user", auth.authorize, (req, res, next) => {
  let email = req.user;
  let updateData = {
    ...req.body,
  };
  Profile.findOneAndUpdate({ email: email }, updateData).then((data) => {
    res.json({ message: "Update Successful" });
  });
});

// Get Profile
router.get("/profiles/:username", (req, res, next) => {
  let username = req.params.username;
  Profile.findOne({ username: username }).then((data) => {
    res.json(data);
  });
});

// Follow a User
router.post("/profiles/:username/follow", auth.authorize, (req, res, next) => {
  Profile.findOneAndUpdate(
    { username: req.params.username },
    { $push: { followers: req.id } }
  ).then((data) => {
    Profile.findOneAndUpdate(
      { email: req.user },
      { $push: { following: data._id } }
    ).then((doc) => {
      res.json({ message: `${doc.username} follows ${data.username}` });
    });
  });
  //   res.json({ message: "Hello" });
});

// Unfollow User
router.delete(
  "/profiles/:username/follow",
  auth.authorize,
  (req, res, next) => {
    Profile.findOneAndUpdate(
      { username: req.params.username },
      { $pull: { followers: req.id } }
    ).then((data) => {
      Profile.findOneAndUpdate(
        { email: req.user },
        { $pull: { following: data._id } }
      ).then((doc) => {
        res.json({ message: `${doc.username} Unfollowed ${data.username}` });
      });
    });
    //   res.json({ message: "Hello" });
  }
);

//
//
// Articles Router
//
//
//  List Articles
router.get("/articles", (req, res, next) => {
  console.log(req.user);
  Profile.findOne({ email: "user3@anand.com" }).then(async (data) => {
    let response = await data.populate("following");
    console.log(response);
    next();
  });
});

// Feed Articles

// Get article

// Create Article
router.post("/articles", (req, res, next) => {});

// Update Article

// Delete Article

// Add Comments to an Article

// Get COmments from an Article

module.exports = router;
