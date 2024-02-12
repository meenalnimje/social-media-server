const mongoose = require("mongoose");
const commnetsSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    postId: {
      type: String,
      require: true,
    },
    desc: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("comment", commnetsSchema);
