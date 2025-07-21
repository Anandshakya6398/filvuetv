const express = require("express");
const {
    getUpcoming,
    getTopRated,
    getTrending,
    getNowPlaying,
} = require("../controllers/DiscoverController.js");

const DiscoverRouter = express.Router();
DiscoverRouter.get("/now_playing", getNowPlaying);
DiscoverRouter.get("/trending", getTrending);
DiscoverRouter.get("/upcoming", getUpcoming);
DiscoverRouter.get("/top_rated", getTopRated);

module.exports = DiscoverRouter;