let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let commentSchema = new Schema({
  body: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Comment", commentSchema);
