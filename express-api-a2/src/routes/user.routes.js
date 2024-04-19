const controller = require("../controllers/user.controller.js");
module.exports = (express, app) => {
    const controller = require("../controllers/user.controller.js");
    const router = express.Router();

    // login
    router.post("/login", controller.login);

    // create a new user.
    router.post("/create", controller.create);

    // edit a user.
    router.post("/edit", controller.edit);

    // get user detail.
    router.post("/detail", controller.detail);

    // delete user
    router.post("/delete", controller.delete);

    // remove(destroy) user: for testing purpose
    router.post("/remove", controller.remove);


    // add routes to server.
    app.use("/api/v1/users", router);
};
