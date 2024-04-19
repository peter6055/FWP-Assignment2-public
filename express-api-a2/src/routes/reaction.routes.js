const controller = require("../controllers/reaction.controller.js");
module.exports = (express, app) => {
    const controller = require("../controllers/reaction.controller.js");
    const router = express.Router();

    // get reaction count from target (reply/post)
    router.post("/getCountFromTarget", controller.getCountFromTarget);

    // get user's reaction of a target (reply/post)
    router.post("/getUserReactionOfTarget", controller.getUserReactionOfTarget);

    // set user's reaction of a target (reply/post)
    router.post("/setUserReactionOnTarget", controller.setUserReactionOnTarget);

    // add routes to server.
    app.use("/api/v1/reactions", router);
};
