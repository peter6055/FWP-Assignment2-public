const db = require("../database");
const generateRestfulResponse = require("../routes/restful.js")
const sanitizeHtml = require("sanitize-html");


// get all followed user from current user
exports.getFollowersFromUserId = async (request, response) => {

    // check is there any user id
    if (request.body.user_id == "") {
        response.json(generateRestfulResponse(400, null, "Please pass user ID."));
        return null; // end function immediately

    } else {
        // verify user_id exist
        const user = await db.user.findAll({
            raw: true,
            attributes: ['user_id'],
            where: {
                user_id: request.body.user_id
            }
        });

        if (user == "") {
            response.json(generateRestfulResponse(404, null, "User not found"));
            return null; // end function immediately

        } else {

            // get the post belongs to user
            const follow = await db.follow.findAll({
                raw: true,
                where: {
                    user_id: request.body.user_id
                }
            });

            // identify is there any posy made by this user
            if (follow == "") {
                response.json(generateRestfulResponse(404, null, "No Records Found"));

            } else {
                response.json(generateRestfulResponse(200, follow, "OK"));

            }
        }

    }
};


// change follow state
// if record exist, call this api, result unfollow
// if record not exist, call this api, result follow
exports.setStatus = async (request, response) => {

    // ---------- check require attributes ----------
    if (request.body.user_id == "" || request.body.followed_user_id == "") {
        response.json(generateRestfulResponse(400, null, "Please pass user ID."));
        return null; // end function immediately
    }

    // ---------- chek user id not equal to followed user id (cannot follow yourself) ----------
    if (request.body.user_id === request.body.followed_user_id) {
        response.json(generateRestfulResponse(400, null, "Please pass different user ID. (Cannot follow yourself)"));
        return null; // end function immediately
    }


    // ---------- check user exist ----------
    // follower(promoters)
    const user = await db.user.findAll({
        raw: true,
        where: {
            user_id: request.body.user_id
        }
    });

    // followed
    const followed_user = await db.user.findAll({
        raw: true,
        where: {
            user_id: request.body.followed_user_id
        }
    });

    if (user == "" || followed_user == "") {
        response.json(generateRestfulResponse(404, null, "User not found"));
        return null; // end function immediately
    }


    // ---------- start the main logic ----------
    const get_previous_follow_record = await db.follow.findAll({
        raw: true,
        where: {
            user_id: request.body.user_id,
            followed_user_id: request.body.followed_user_id
        }
    });

    let action;

    if (get_previous_follow_record != "") {
        // record exist
        await db.follow.destroy({
            where: {
                user_id: request.body.user_id,
                followed_user_id: request.body.followed_user_id
            }
        });

        action = "unfollowed";

    } else {
        // record not exist
        await db.follow.create({
            raw: true,
            user_id: request.body.user_id,
            followed_user_id: request.body.followed_user_id
        });

        action = "followed";

    }

    // generate json string
    let result = "{\"current_user_id\":\"" + request.body.user_id + "\",\"followed_user_id\":\"" + request.body.followed_user_id + "\"}"

    response.json(generateRestfulResponse(200, JSON.parse(result), "Note for development, result state: " + action));

};
