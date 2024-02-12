const { success, error } = require("../utilies/responseWrapper");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.send(error(400, "Plz enter Email /Password "));
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.send(error(409, "User already exits"));
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });
    return res.send(success(201, "user created successfully"));
  } catch (e) {
    console.log("this is the error from signup side", e);
    return res.send(error(500, e.message));
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send(error(400, "Plz enter email id/password"));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.send(error(404, "user not registered"));
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.send(error(403, "Incorrect password"));
    }
    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = generateRefreshToken({ _id: user._id });
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, { accessToken }));
  } catch (e) {
    console.log("this is the error from login side", e);
    return res.send(error(500, e.message));
  }
};
const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required"));
  }
  const refreshToken = cookies.jwt;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_KEY);
    const _id = decoded._id;
    const accessToken = generateAccessToken({ _id });
    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log("this error is from refreshAccessToken side", e);
    return res.send(error(500, e.message));
  }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, "user logged out"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};
// const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.send(error(404, "Email could not be sent"));
//     }
//     const resetToken = generateResetPasswordToken();
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");
//     user.resetPasswordExpired = Date.now() + 10 * (60 * 1000);
//     await user.save();
//     const resetURL = `http://localhost:3000/passwordreset/${resetToken}`;
//     const message = `
//     <h1> you have requested for a password reset</h1>
//     <p>please go to this link to reset your password</p>
//     <a href=${resetURL} clicktracking=off>${resetURL}</a>
//     `;
//     try {

//     } catch (e) {}
//   } catch (e) {}
// };
// const resetPassword = (req, res) => {};
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_KEY, {
      expiresIn: "1d",
    });
    return token;
  } catch (e) {
    console.log("this error is from access token generator function", e);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_KEY, {
      expiresIn: "1y",
    });
    return token;
  } catch (e) {
    console.log(
      "this error is from refresh token generating function side ",
      e
    );
  }
};
// const generateResetPasswordToken = () => {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   // const user = await User.findById(_id);
//   // user.resetPasswordToken = crypto
//   //   .createHash("sha256")
//   //   .update(resetToken)
//   //   .digest("hex");
//   // await user.save();
//   return resetToken;
// };
module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
};
