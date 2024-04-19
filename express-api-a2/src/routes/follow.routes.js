const controller = require("../controllers/follow.controller.js");
module.exports = (express, app) => {
    const controller = require("../controllers/follow.controller.js");
    const router = express.Router();

    // get all follower to make list
    router.post("/getFollowersFromUserId", controller.getFollowersFromUserId);

    // get all post from user id
    router.post("/setStatus", controller.setStatus);


    // add routes to server.
    app.use("/api/v1/follows", router);
};
