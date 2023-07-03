const express = require("express");
const app = express();
const dotenv = require("dotenv");
const dbConnect = require("./dbConnect");
const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
dotenv.config("./.env");

// Configuration
cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});
// limit:10mb is for uploading image of max. size 10mb
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);
const PORT = process.env.PORT || 4001;
dbConnect();
app.listen(PORT, () => {
  console.log(`server has started at the port ${PORT}`);
});
