const router = require("express").Router();
const userController = require("../controllers/userController");
const requireUser = require("../middlewares/requireUser");
router.post("/followUnfollow", requireUser, userController.followAndUnfollow);
router.get("/getFeedData", requireUser, userController.getFeedData);
router.post("/all", requireUser, userController.getAllUser);
router.get("/", requireUser, userController.getMyPost);
router.post("/user", requireUser, userController.getUserPosts);
router.delete("/", requireUser, userController.deleteMyProfile);
router.get("/myInfo", requireUser, userController.getMyInfo);
router.post("/userInfo", requireUser, userController.getUserInfo);
router.put("/", requireUser, userController.updateMyProfile);
module.exports = router;
// getmypost,deletemyprofile,getuserpost {user id lenge}
