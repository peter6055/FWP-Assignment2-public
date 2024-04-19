const controller = require("../controllers/reply.controller.js");
module.exports = (express, app) => {
    const controller = require("../controllers/reply.controller.js");
    const router = express.Router();

    // get all reply
    router.get("/getAll", controller.getAll);

    // get all reply from a post
    router.post("/getAllFromPost", controller.getAllFromPost);

    // get all reply from a reply
    router.post("/getAllFromReply", controller.getAllFromReply);

    // get single reply
    router.post("/getSingle", controller.getSingle);

    // create a new reply.
    router.post("/create", controller.create);

    // create a new reply.
    router.post("/delete", controller.delete);

    // add routes to server.
    app.use("/api/v1/replies", router);
};
