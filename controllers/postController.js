const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utilies/responseWrapper");
const { mapPostOutput } = require("../utilies/Utiles");
const cloudinary = require("cloudinary").v2;

const createPost = async (req, res) => {
  try {
    const { caption, postImg } = req.body;
    if (!caption) {
      return res.send(error(400, "caption and post image is required"));
    }
    // const cloudImg = await cloudinary.uploader.upload(postImg, {
    //   folder: "postImg",
    // });
    const ownerId = req._id;
    const user = await User.findById(req._id);
    const post = await Post.create({
      owner: ownerId,
      caption,
      // image: {
      //   publicId: cloudImg.public_id,
      //   url: cloudImg.secure_url,
      // },
    });
    user.posts.push(post._id);
    // here we used save() becz we updated the user model
    await user.save();
    return res.json(success(201, { post }));
  } catch (e) {
    console.log("this error is from createPost side ", e);
    return res.send(error(500, e.message));
  }
};
const likeAndUnlike = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;
    const post = await Post.findById(postId).populate("owner");
    if (!post) {
      return res.send(error(404, "post not found"));
    }
    const index = post.likes.indexOf(currUserId);
    if (index !== -1) {
      // only splice array when item is found
      post.likes.splice(index, 1); // 2nd parameter means remove one item only
    } else {
      post.likes.push(currUserId);
    }
    await post.save();
    return res.send(success(200, { post: mapPostOutput(post, req._id) }));
  } catch (e) {
    console.log("this error is from likeAndUnlike post", e);
    return res.send(error(500, e.message));
  }
};
const updatePost = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const currUserId = req._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }
    const owner = post.owner.toString();
    if (currUserId === owner) {
      post.caption = caption;
    } else {
      return res.send(error(403, "Only owners can update "));
    }
    await post.save();
    return res.send(success(200, { post }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
const deletePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const curUserId = req._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "post not found"));
    }
    if (post.owner.toString() !== curUserId) {
      return res.send(error(403, "only owners can delete their post"));
    }
    const curUser = await User.findById(curUserId);
    const index = curUser.posts.indexOf(postId);
    curUser.posts.splice(index, 1);
    await curUser.save();
    await Post.findByIdAndDelete(postId);
    return res.send(success(200, "post deleted successfully"));
  } catch (e) {
    console.log("this error is from delete post side ", e);
    return res.send(error(500, e.message));
  }
};
const bookmarkPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req._id;
    const user = await User.findById(userId);
    if (user.bookmarks.includes(postId)) {
      const index = user.bookmarks.indexOf(postId);
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(postId);
    }
    await user.save();
    return res.send(success(200, "post bookmarked"));
  } catch (e) {
    console.log("this error is from bookmark the post side ", e);
    return res.send(error(500, e.message));
  }
};
const getBookmarkPost = async (req, res) => {
  const userId = req._id;
  const user = await User.findById(userId);
  const bookmarks = await Post.find({
    _id: { $in: user.bookmarks },
  }).populate("owner");
  const modified = bookmarks.map((items) => mapPostOutput(items, req._id));
  return res.send(success(200, { modified }));
};
module.exports = {
  likeAndUnlike,
  createPost,
  updatePost,
  deletePost,
  bookmarkPost,
  getBookmarkPost,
};
