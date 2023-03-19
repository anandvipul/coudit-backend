let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let articleSchema = new Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    body: { type: String },
    tagList: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    favCount: { type: Number },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", articleSchema);
