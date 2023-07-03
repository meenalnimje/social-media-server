// since we want to represent user in a schematic manner which we are getting through getUserInfo
// this post parameter is from mongodb Post
var ta = require("time-ago"); // node.js
const mapPostOutput = (post, userId) => {
  return {
    _id: post._id,
    caption: post.caption,
    image: post.image,
    owner: {
      _id: post.owner._id,
      name: post.owner.name,
      avatar: post.owner.avatar,
    },
    createdAt: post.createdAt,
    likes: post.likes.length,
    isLiked: post.likes.includes(userId),
    timeAgo: ta.ago(post.createdAt),
  };
};
module.exports = { mapPostOutput };
