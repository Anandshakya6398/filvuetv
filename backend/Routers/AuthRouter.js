const express = require("express");

const {
  loginHandler,
  signupHandler,
  forgetPasswordHandler,
  resetPasswordHandler,
  logoutController,
} = require("../controllers/AuthController");
const AuthRouter = express.Router();

AuthRouter.post("/login", loginHandler);
AuthRouter.post("/signup", signupHandler);
AuthRouter.patch("/forgetPassword", forgetPasswordHandler);
AuthRouter.patch("/resetPassword", resetPasswordHandler);
AuthRouter.get("/logout", logoutController);

module.exports = AuthRouter;

// const express = require("express");
// const {
//   loginHandler,
//   signupHandler,
//   forgetPasswordHandler,
//   resetPasswordHandler,
//   logoutController,
//   protectRouteMiddleWare,
//   getCurrentUserController,
// } = require("../controllers/AuthController");

// const AuthRouter = express.Router();

// AuthRouter.post("/login", loginHandler);
// AuthRouter.post("/signup", signupHandler);
// AuthRouter.patch("/forgetPassword", forgetPasswordHandler);
// AuthRouter.patch("/resetPassword", resetPasswordHandler);
// AuthRouter.get("/logout", logoutController);

// //  Route to get current logged-in user
// AuthRouter.get("/getCurrentUser", protectRouteMiddleWare, getCurrentUserController);

// module.exports = AuthRouter;
