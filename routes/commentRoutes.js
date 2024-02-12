const express = require("express");
const router = express.Router();
const requireUser = require("../middlewares/requireUser");
const commentController = require("../controllers/commentController");
router.get("/:postId", requireUser, commentController.getComment);
router.post("/", requireUser, commentController.addComment);
router.delete("/:id", requireUser, commentController.deleteComment);
module.exports = router;
