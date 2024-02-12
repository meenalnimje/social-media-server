const comments = require("../models/Comment");
const Post = require("../models/Post");
const { success, error } = require("../utilies/responseWrapper");
const addComment = async (req, res) => {
  try {
    const newComment = new comments({ owner: req._id, ...req.body });
    await newComment.save();
    return res.send(success(201, { newComment }));
  } catch (e) {
    console.log("this error is from addComment side ", e);
  }
};
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const commentToDelete = await comments.findById(id);
    console.log("comment to delete", commentToDelete.owner._id.toString());
    const postid = commentToDelete.postId;
    const post = await Post.findById(postid);
    console.log("post", post.owner._id.toString());
    console.log(req._id);
    if (
      req._id === commentToDelete.owner._id.toString() ||
      req._id === post.owner._id.toString()
    ) {
      await comments.findByIdAndDelete(id);
      return res.send(success(200, "comment has been deleted"));
    } else {
      return res.send(error(403, "only owner can delete the comment"));
    }
  } catch (e) {
    console.log("this error is from delete comment side ", e);
  }
};
const getComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const comment = await comments.find({ postId: postId }).populate("owner");
    comment.reverse();
    return res.send(success(200, { comment }));
  } catch (e) {
    console.log("this error is from get comment side ", e);
  }
};
module.exports = { addComment, getComment, deleteComment };
