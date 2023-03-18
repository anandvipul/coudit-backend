let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let profileSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String },
    image: { type: String },
    following: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Profile" }],
    articlesAuthored: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    articlesFav: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
