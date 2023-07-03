const Post = require("../models/Post");
const User = require("../models/User");
const { post } = require("../routes/userRoutes");
const { mapPostOutput } = require("../utilies/Utiles");
const { success, error } = require("../utilies/responseWrapper");
const cloudinary = require("cloudinary").v2;
const followAndUnfollow = async (req, res) => {
  try {
    const { userId } = req.body;
    const currUserId = req._id;
    const users = await User.findById(userId);
    const currUser = await User.findById(currUserId);
    if (currUserId === userId) {
      return res.send(error(409, "User cannot follow themselves"));
    }
    if (!users) {
      return res.send(error(404, "User not found"));
    }
    if (currUser.followings.includes(userId)) {
      const followingIndex = currUser.followings.indexOf(userId);
      const followerIndex = users.followers.indexOf(currUserId);
      users.followers.splice(followerIndex, 1);
      currUser.followings.splice(followingIndex, 1);
    } else {
      users.followers.push(currUserId);
      currUser.followings.push(userId);
    }
    await users.save();
    await currUser.save();
    return res.send(success(200, { user: users }));
  } catch (e) {
    console.log("this error is from follow unfollow side", e);
    return res.send(error(500, e.message));
  }
};
const getFeedData = async (req, res) => {
  // const userId = req._id;
  // const user = await User.findById(userId);
  // const userFollowings = user.followings;
  // let newPosts = [];
  // for (let i = 0; i < userFollowings.length; i++) {
  //   const userFollowingsId = userFollowings[i].toString();
  //   const post = await Post.find({ owner: userFollowingsId });
  //   newPosts = [...newPosts, post];
  // }
  // return res.send(success(200, newPosts));

  // method 2;
  try {
    const userId = req._id;
    const user = await User.findById(userId).populate("followings");
    const fullpost = await Post.find({
      owner: { $in: user.followings },
    }).populate("owner");
    const posts = fullpost
      .map((items) => mapPostOutput(items, req._id))
      .reverse();
    // bookmarks
    const bookmarks = await Post.find({
      _id: { $in: user.bookmarks },
    });
    // suggestions;
    const followingIds = user.followings.map((item) => item._id);
    const suggestions = await User.find({
      _id: {
        $nin: followingIds,
        $ne: userId,
      },
    });
    return res.send(
      success(200, { ...user._doc, suggestions, posts, bookmarks })
    );
  } catch (e) {
    console.log("this error is from getPostOfFollowing side", e);
    return res.send(error(500, e.message));
  }
};
const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);
    // delete all post
    await Post.deleteMany({ owner: curUserId });
    // followers ke followings me se delete karna hai
    curUser.followers.forEach(async (followerId) => {
      const follower = await User.findById(followerId);
      const index = follower.followings.indexOf(curUserId);
      if (index !== -1) {
        follower.followings.splice(index, 1);
        await follower.save();
      }
    });
    // followings ki follower list ke bhi nikalna hoga.
    curUser.followings.forEach(async (followingId) => {
      const following = await User.findById(followingId);
      const index = following.followers.indexOf(curUserId);
      if (index !== -1) {
        following.followers.splice(index, 1);
        await following.save();
      }
    });
    //removing myself from the likes
    const allPost = await Post.find();
    allPost.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      if (index !== -1) {
        post.likes.splice(index, 1);
        await post.save();
      }
    });
    // delete user
    await User.deleteOne({ _id: curUserId });
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "user deleted successfully"));
  } catch (e) {
    console.log("this error is from deletMyProfile side", e);
    return res.send(error(500, e.message));
  }
};
const getMyPost = async (req, res) => {
  try {
    // const userId = req._id;
    // const user = await User.findById(userId);
    // const posts = user.posts;
    // for (let i = 0; i < posts.length; i++) {
    //   const element = posts[i];
    //   const postId = element.toString();
    //   const post = await Post.find({ _id: postId });
    //   return res.send(success(200,));
    // }
    const userId = req._id;
    const post = await Post.find({ owner: userId }).populate("likes");
    return res.send(success(200, { post }));
  } catch (e) {
    console.log("this error is from getMyPost side", e);
    return res.send(error(500, e.message));
  }
};
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    const currUserId = req._id;
    if (!user) {
      return res.send(error(404, "user not found"));
    }
    const postOfUser = await Post.find({ owner: { $in: user } }).populate(
      "likes"
    );
    return res.send(success(200, { postOfUser }));
  } catch (e) {
    console.log("this error is from getUserPosts side", e);
    return res.send(error(500, e.message));
  }
};
const getMyInfo = async (req, res) => {
  try {
    const userId = req._id;
    const user = await User.findById(userId).populate("posts");
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("this error is from getMyInfo site ", e);
    return res.send(error(500, e.message));
  }
};
const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;
    const user = await User.findById(req._id);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = await cloudinary.uploader.upload(userImg, {
        folder: "profileImg",
      });
      user.avatar = {
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id,
      };
    }
    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    console.log("this error is from updateMyProfile controller site ", e);
    return res.send(error(500, e.message));
  }
};
const getUserInfo = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });
    const fullPosts = user.posts;
    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    // ...user._doc isme user ke actual info rehti hai
    return res.send(success(200, { ...user._doc, posts }));
  } catch (e) {
    console.log("this error is from getUserInfo controller ", e);
    return res.send(error(500, e.message));
  }
};

const getAllUser = async (req, res) => {
  try {
    const { username } = req.body;
    const users = await User.find({ name: { $regex: `${username}` } });
    // console.log("all the users ", users);
    return res.send(success(200, { users }));
  } catch (e) {
    console.log("this error is from getAllUser controller ", e);
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followAndUnfollow,
  getFeedData,
  getMyPost,
  getUserPosts,
  deleteMyProfile,
  getMyInfo,
  updateMyProfile,
  getUserInfo,
  getAllUser,
};
