const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    bio: {
      type: String,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      select: false,
    },
    avatar: {
      // publicId we will used to store image in cloudinary
      publicId: String,
      // url will be used to show image on page
      url: String,
    },
    resetPasswordToken: String,
    resetPasswordExpired: Date,
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("user", userSchema);
