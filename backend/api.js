const mongoose = require("mongoose");
const express = require("express");
const app = express();
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan")
const mongoSanatize = require("express-mongo-sanitize");
const helmet = require("helmet");
const rateLimiter = require("express-rate-limit");

dotenv.config();

const limiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
})

// Middleware setup
app.use(limiter)
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(mongoSanatize());
app.use(helmet());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev")); //logger for debugging
}
// allowing frontend to access the api

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

const corsConfig = {
  origin: allowedOrigins, // Use the actual array instead of true
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

// Router imports
const AuthRouter = require("./Routers/AuthRouter");
const MovieRouter = require("./Routers/MovieRouter");
const TvShowsRouter = require("./Routers/TvRouter");
const DiscoverRouter = require("./Routers/DiscoverRouter");
const UserRouter = require("./Routers/UserRouter");
const VideoRouter = require("./Routers/VideoRouter");
const PaymentRouter = require("./Routers/PaymentRouter");

// Router middleware
app.use("/api/auth/", AuthRouter);
app.use("/api/movies", MovieRouter);
app.use("/api/tv", TvShowsRouter);
app.use("/api/discover", DiscoverRouter);
app.use("/api/user", UserRouter);
app.use("/api/video", VideoRouter);
app.use("/api/payment", PaymentRouter);

// Conditional DB connection and server startup
async function startServer() {
    // Only connect to DB in development mode
    if (process.env.NODE_ENV !== 'test') {
       const dbLink = `mongodb+srv://admin:${process.env.DB_PASSWORD}@cluster0.ulwg9cc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

        try {
            await mongoose.connect(dbLink);
            console.log("Connected to DB");
        } catch (err) {
            console.log("DB Connection Error:", err);
        }
    }

    // Define ports
    const PORT = process.env.NODE_ENV === 'test' ? 5000 : process.env.PORT;



    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Start server if not being required by another module (like tests)
if (process.env.NODE_ENV != 'test') {
    startServer();
}


// Export for testing
module.exports = { app };