const UserModel = require("../Model/UserModel");
const emailSender = require("../utility/DynamicEmailSender");
const jwt = require("jsonwebtoken");
const promisify = require("util").promisify;
const promisifiedJWTSign = promisify(jwt.sign);
const promisifiedJWTVerify = promisify(jwt.verify);
const { JWT_SECRET_KEY } = process.env;


async function forgetPasswordHandler(req, res) {
    try {

        /****
         * 1. user send the email : extract email
         * 2. check if email is present in DB (user)
              * if email is not present -> send a response to the user(user not found)
           * *  if email is present -> 
           * 3. create basic otp -> 
           *        * user  ke saath token map krdo
           *        *  send to the email
           * 4. url -> reset url -> id      
         *         
         * ***/
        //1.
        if (req.body.email == undefined) {
            return res.status(401).json({
                status: "failure",
                message: "Please enter the email for forget Password"
            })
        }
        //2.
        const user = await UserModel.findOne({ email: req.body.email });
        if (user == null) {
            return res.status(404).json({
                status: "failure",
                message: "user not found for this email"
            })
        }
        //3. 
        const otp = otpGenerator();
        user.otp = otp;
        user.otpExpiry = Date.now() + 1000 * 60 * 10;

        await user.save({ validateBeforeSave: false });
        //  send email
        // email -> req.body.email
        // otp -> add 

        res.status(200).json({
            message: "otp is send successfully",
            status: "success",
            otp: otp,
            resetURL: `http://localhost:3000/api/auth/resetPassword/${user["_id"]}`
        })
        const templateData = { name: user.name, otp: user.otp }
        await emailSender("./templates/otp.html", user.email, templateData);
    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}

async function resetPasswordHandler(req, res) {
    try {
        /**
         * 1. id ,  id
         * 2. if otp , password , confirmPassword are present
         *      *  otp should n't be expires
         *      * otp compare -> if matches
         *      *  password update
         *      *  re-route them to login page
         * ***/
        let resetDetails = req.body;
        // required fields are there or not 
        if (!resetDetails.password || !resetDetails.confirmPassword
            || !resetDetails.otp
            || resetDetails.password != resetDetails.confirmPassword) {
           return res.status(401).json({
                status: "failure",
                message: "invalid request"
            })
        }
        const user = await UserModel.findOne({ email: req.body.email });
        // if user is not present
        if (user == null) {
            return res.status(404).json({
                status: "failure",
                message: "user not found"
            })
        }
        // if otp is not present  in db user
        if (user.otp == undefined) {
            return res.status(401).json({
                status: "failure",
                message: "unauthorized acces to reset Password"
            })
        }

        // if otp is expired
        if (Date.now() > user.otpExpiry) {
            return res.status(401).json({
                status: "failure",
                message: "otp expired"
            })
        }
        // if otp is incorrect
        if (user.otp != resetDetails.otp) {
            return res.status(401).json({
                status: "failure",
                message: "otp is incorrect"
            })
        }
        user.password = resetDetails.password;
        user.confirmPassword = resetDetails.confirmPassword;
        // remove the otp from the user
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        res.status(200).json({
            status: "success",
            message: "password reset successfully"
        })

    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}


async function signupHandler(req, res) {
  
    // 3. create the user
    try {
       
        const userObject = req.body;
        // 1. user -> data get , check email , password
        if (!userObject.email || !userObject.password) {
            return res.status(400).json({
                "message": "required data missing",
                status: "failure"
            })
        }
     
        
        // 2. email se check -> if exist -> already loggedIn 
        const user = await UserModel.findOne({ email: userObject.email });
        if (user) {
            return res.status(400).json({
                "message": "user is already signed  up",
                status: "failure"
            })
        }

        
        const newUser = await UserModel.create(userObject);
        // hash the new user password
        // send a response 
        res.status(201).json({
            "message": "user signup successfully",
            user: newUser,
            status: "success"
        })

        // user Email -> verification of there Email Id 
        // welcome Email 
    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        })
    }
}
async function loginHandler(req, res) {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid email or password",
                status: "failure"
            });
        }

        const areEqual = password == user.password;
        if (!areEqual) {
            return res.status(400).json({
                message: "Invalid email or password",
                status: "failure"
            });
        }

        const authToken = await promisifiedJWTSign({ id: user["_id"] }, process.env.JWT_SECRET_KEY);

        // 👇 This is the correct cookie config:
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("jwt", authToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        });

        res.status(200).json({
            message: "login successfully",
            status: "success",
            user: user
        });
    } catch (err) {
        console.log("err", err);
        res.status(500).json({
            message: err.message,
            status: "failure"
        });
    }
}


const otpGenerator = function () {
    return Math.floor(100000 + Math.random() * 900000);
}
const protectRouteMiddleWare = async function (req, res, next) {
    try {
        let jwttoken = req.cookies.jwt;
        if (!jwttoken) throw new Error("UnAuthorized!");

        let decryptedToken = await promisifiedJWTVerify(jwttoken, JWT_SECRET_KEY);

        if (decryptedToken) {
            let userId = decryptedToken.id;
            // adding the userId to the req object
            req.userId = userId;
            console.log("authenticated");
            next();
        }
    } catch (err) {
        res.status(500).json({
            message: err.message,
            status: "failure",
        });
    }
};
const logoutController = function (req, res) {
    res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None", // Change to "Strict" if frontend and backend are on same origin
    path: "/",
  });

    res.status(200).json({
        status: "success",
        message: "user logged out ",
    });
};
module.exports = {
    forgetPasswordHandler,
    resetPasswordHandler,
    signupHandler,
    loginHandler,
    logoutController,
    protectRouteMiddleWare,

}








// const UserModel = require("../Model/UserModel");
// const emailSender = require("../utility/DynamicEmailSender");
// const jwt = require("jsonwebtoken");
// const promisify = require("util").promisify;
// const promisifiedJWTSign = promisify(jwt.sign);
// const promisifiedJWTVerify = promisify(jwt.verify);
// const { JWT_SECRET_KEY } = process.env;

// // Utility
// const otpGenerator = () => Math.floor(100000 + Math.random() * 900000);

// // Signup
// async function signupHandler(req, res) {
//     try {
//         const userObject = req.body;
//         if (!userObject.email || !userObject.password) {
//             return res.status(400).json({
//                 message: "required data missing",
//                 status: "failure"
//             });
//         }

//         const user = await UserModel.findOne({ email: userObject.email });
//         if (user) {
//             return res.status(400).json({
//                 message: "user is already signed up",
//                 status: "failure"
//             });
//         }

//         const newUser = await UserModel.create(userObject);

//         res.status(201).json({
//             message: "user signup successfully",
//             user: newUser,
//             status: "success"
//         });
//     } catch (err) {
//         console.log("err", err);
//         res.status(500).json({
//             message: err.message,
//             status: "failure"
//         });
//     }
// }

// // Login
// async function loginHandler(req, res) {
//     try {
//         const { email, password } = req.body;
//         const user = await UserModel.findOne({ email });

//         if (!user || password !== user.password) {
//             return res.status(400).json({
//                 message: "Invalid email or password",
//                 status: "failure"
//             });
//         }

//         const authToken = await promisifiedJWTSign({ id: user["_id"] }, JWT_SECRET_KEY);
//         res.cookie("jwt", authToken, {
//             maxAge: 1000 * 60 * 60 * 24,
//             secure: true,
//             httpOnly: true,
//         });

//         res.status(200).json({
//             message: "login successfully",
//             status: "success",
//             user: user
//         });

//     } catch (err) {
//         console.log("err", err);
//         res.status(500).json({
//             message: err.message,
//             status: "failure"
//         });
//     }
// }

// // Forget Password
// async function forgetPasswordHandler(req, res) {
//     try {
//         if (!req.body.email) {
//             return res.status(401).json({
//                 status: "failure",
//                 message: "Please enter the email for forget Password"
//             });
//         }

//         const user = await UserModel.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(404).json({
//                 status: "failure",
//                 message: "user not found for this email"
//             });
//         }

//         const otp = otpGenerator();
//         user.otp = otp;
//         user.otpExpiry = Date.now() + 1000 * 60 * 10;

//         await user.save({ validateBeforeSave: false });

//         const templateData = { name: user.name, otp: user.otp };
//         await emailSender("./templates/otp.html", user.email, templateData);

//         res.status(200).json({
//             message: "otp is send successfully",
//             status: "success",
//             otp: otp,
//             resetURL: `http://localhost:3000/api/auth/resetPassword/${user["_id"]}`
//         });

//     } catch (err) {
//         console.log("err", err);
//         res.status(500).json({
//             message: err.message,
//             status: "failure"
//         });
//     }
// }

// // Reset Password
// async function resetPasswordHandler(req, res) {
//     try {
//         let resetDetails = req.body;

//         if (!resetDetails.password || !resetDetails.confirmPassword || !resetDetails.otp || resetDetails.password !== resetDetails.confirmPassword) {
//             return res.status(401).json({
//                 status: "failure",
//                 message: "invalid request"
//             });
//         }

//         const user = await UserModel.findOne({ email: req.body.email });
//         if (!user) {
//             return res.status(404).json({
//                 status: "failure",
//                 message: "user not found"
//             });
//         }

//         if (!user.otp || Date.now() > user.otpExpiry || user.otp !== resetDetails.otp) {
//             return res.status(401).json({
//                 status: "failure",
//                 message: "otp expired or incorrect"
//             });
//         }

//         user.password = resetDetails.password;
//         user.confirmPassword = resetDetails.confirmPassword;
//         user.otp = undefined;
//         user.otpExpiry = undefined;
//         await user.save();

//         res.status(200).json({
//             status: "success",
//             message: "password reset successfully"
//         });

//     } catch (err) {
//         console.log("err", err);
//         res.status(500).json({
//             message: err.message,
//             status: "failure"
//         });
//     }
// }

// // Logout
// function logoutController(req, res) {
//     res.cookie("jwt", "", {
//         maxAge: 0,
//         httpOnly: true,
//         secure: true,
//     });

//     res.status(200).json({
//         status: "success",
//         message: "user logged out"
//     });
// }

// // Middleware: Protect Route
// const protectRouteMiddleWare = async function (req, res, next) {
//     try {
//         let jwttoken = req.cookies.jwt;
//         if (!jwttoken) throw new Error("UnAuthorized!");

//         let decryptedToken = await promisifiedJWTVerify(jwttoken, JWT_SECRET_KEY);

//         if (decryptedToken) {
//             let userId = decryptedToken.id;
//             req.userId = userId;
//             console.log("authenticated");
//             next();
//         }
//     } catch (err) {
//         res.status(500).json({
//             message: err.message,
//             status: "failure",
//         });
//     }
// };

// // Get Current User
// const getCurrentUserController = async (req, res) => {
//     try {
//         const userId = req.userId;
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found",
//                 status: "failure"
//             });
//         }
//         res.status(200).json({
//             message: "User retrieved successfully",
//             status: "success",
//             user: user
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: err.message,
//             status: "failure"
//         });
//     }
// };

// module.exports = {
//     forgetPasswordHandler,
//     resetPasswordHandler,
//     signupHandler,
//     loginHandler,
//     logoutController,
//     protectRouteMiddleWare,
//     getCurrentUserController,
// };
