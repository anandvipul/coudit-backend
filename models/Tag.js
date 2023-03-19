let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let tagSchema = new Schema(
  {
    title: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
