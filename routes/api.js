let router = require("express").Router();
const { LocalStorage } = require("node-localstorage");
let User = require("../models/User");
let Profile = require("../models/Profile");
let localStorage = require("node-localstorage").LocalStorage;
let auth = require("../middleware/auth");
let Mongoose = require("mongoose");
let Article = require("../models/Article");
let Comment = require("../models/Comment");
const Tag = require("../models/Tag");

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
router.post("/articles", auth.authorize, async (req, res, next) => {
  let article = req.body;
  let slug = req.body.title.split(" ").join("-");
  let newArticle = await Article.create({
    slug: slug,
    author: req.id,
    ...article,
  });
  Profile.findOneAndUpdate(
    { email: req.user },
    { $push: { articlesAuthored: newArticle } }
  ).then((doc) => {
    console.log(doc);
    res.json(doc);
  });
});

// Update Article
router.put("/articles/:slug", auth.authorize, async (req, res, next) => {
  let slug = req.params.slug;
  let article = await Article.findOne({ slug: slug });
  // Check if logged in user is eleigible to edit the article
  //   console.log(slug);
  await Profile.find({
    articlesAuthored: { $elemMatch: { $eq: article._id } },
  }).then(async (doc) => {
    console.log(doc);
    if (doc !== null) {
      await Article.updateOne({ _id: article._id }, { ...req.body });
    }
    res.json({ message: "found it" });
  });
});
// Delete Article
router.delete("/articles/:slug", auth.authorize, async (req, res, next) => {
  let slug = req.params.slug;
  let article = await Article.findOne({ slug: slug });
  // Check if logged in user is eleigible to edit the article
  //   console.log(slug);
  await Profile.find({
    articlesAuthored: { $elemMatch: { $eq: article._id } },
  }).then(async (doc) => {
    console.log(doc);
    if (doc !== null) {
      let index = await doc[0].articlesAuthored.indexOf(article._id);
      doc[0].articlesAuthored.splice(index, 1);
      await doc[0].save();
      await Article.findByIdAndDelete(article._id);
      res.json({ message: "Deleted" });
    }
  });
});

// Add Comments to an Article
router.post(
  "/articles/:slug/comments",
  auth.authorize,
  async (req, res, next) => {
    let userId = req.id;

    let newComment = new Comment({ author: userId, ...req.body });

    Article.findOne({ slug: req.params.slug }).then(async (doc) => {
      await doc.comments.push(newComment);
      await doc.save();
      await newComment.save();
      await res.json(doc);
    });
  }
);

// Get Comments from an Article
router.get("/articles/:slug/comments", (req, res, next) => {
  Article.findOne({ slug: req.params.slug })
    .populate("comments")
    .then((data) => {
      res.json(data.comments);
    });
});

// Delete Comment
router.delete(
  "/articles/:slug/comments/:id",
  auth.authorize,
  async (req, res, next) => {
    let slug = req.params.slug;
    let id = req.params.id;
    Comment.findByIdAndDelete(id).then({
      message: "deleted Comment",
    });
  }
);

// Favorite Article
router.post(
  "/articles/:slug/favourite",
  auth.authorize,
  async (req, res, next) => {
    let article = await Article.findOne({ slug: req.params.slug });
    Profile.findById(req.id).then(async (doc) => {
      await doc.articlesFav.push(article._id);
      doc.save();
      res.json(doc);
    });
  }
);

// Unfavorite Article
router.delete(
  "/articles/:slug/favourite",
  auth.authorize,
  async (req, res, next) => {
    let article = await Article.findOne({ slug: req.params.slug });
    Profile.findById(req.id).then(async (doc) => {
      let indexFav = doc.articlesFav.indexOf(article._id);
      await doc.articlesFav.splice(indexFav, 1);
      doc.save();
      res.json(doc);
    });
  }
);

// Get tags
router.get("/tags", async (req, res, next) => {
  Tag.find().then((data) => {
    res.json(data);
  });
});

module.exports = router;
