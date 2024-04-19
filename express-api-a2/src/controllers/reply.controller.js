const db = require("../database");
const generateRestfulResponse = require("../routes/restful.js")
var uuid = require('uuid');
const sanitizeHtml = require('sanitize-html');


// get all reply
exports.getAll = async (request, response) => {

    const reply = await db.reply.findAll({
        raw: true,
        where: {
            is_del: 0
        }
    });

    if (reply == "") {
        // Login failed.
        response.json(generateRestfulResponse(404, null, "No Replies Found"));
    } else {
        response.json(generateRestfulResponse(200, reply, ""));
    }

};


// get all reply from a post
exports.getAllFromPost = async (request, response) => {

    if (request.body.parent_post_id == "") {
        response.json(generateRestfulResponse(400, null, "Post ID not specify"));
        return null; //end immediately
    }

    const reply = await db.reply.findAll({
        raw: true,
        where: {
            parent_post_id: request.body.parent_post_id,
            is_del: 0
        }
    });

    if (reply == "") {
        response.json(generateRestfulResponse(404, null, "No Replies Found"));
    } else {
        response.json(generateRestfulResponse(200, reply, ""));
    }

};


// get all reply from a reply
exports.getAllFromReply = async (request, response) => {

    if (request.body.parent_reply_id == "") {
        response.json(generateRestfulResponse(400, null, "Reply ID not specify"));
        return null; //end immediately
    }

    const reply = await db.reply.findAll({
        raw: true,
        where: {
            parent_reply_id: request.body.parent_reply_id,
            is_del: 0
        }
    });

    if (reply == "") {
        response.json(generateRestfulResponse(404, null, "No Replies Found"));
    } else {
        response.json(generateRestfulResponse(200, reply, ""));
    }

};


// get a reply
exports.getSingle = async (request, response) => {
    if (request.body.reply_id == "") {
        response.json(generateRestfulResponse(400, null, "Reply ID not specify"));

    } else {
        const reply = await db.reply.findAll({
            raw: true,
            where: {
                reply_id: request.body.reply_id,
                is_del: 0
            }
        });

        if (reply == "") {
            // Login failed.
            response.json(generateRestfulResponse(404, null, "No Replies Found"));

        } else {
            response.json(generateRestfulResponse(200, reply, ""));

        }
    }
};


// make a reply
exports.create = async (request, response) => {

    // -------------------------------- verify the logic of its parent --------------------------------
    // ---------------- is empty check ----------------
    // action that user willing to do
    var action;
    if (request.body.parent_post_id != "" && request.body.parent_reply_id == "") {
        // Parent is post: parent_post_id V | parent_reply_id X
        action = "reply_to_post";

    } else if (request.body.parent_post_id != "" && request.body.parent_reply_id != "") {
        // Parent is reply: parent_post_id V | parent_reply_id v
        action = "reply_to_reply";

    } else {
        response.json(generateRestfulResponse(400, null, "Required value missing, should be either reply to post or reply to reply"));
        return null; // end function immediately
    }


    // ---------------- is id exist check ----------------
    if (action === "reply_to_post") {
        // Reply to post require to have post id, check is it exist
        const founded_post = await db.post.findAll({
            raw: true,
            attributes: ['post_id'],
            where: {
                post_id: request.body.parent_post_id
            }
        });

        if (founded_post == "") {
            response.json(generateRestfulResponse(404, null, "Post not found"));
            return null; // end function immediately
        }


    } else if (action === "reply_to_reply") {
        // Reply to reply require to have post id and reply id, check is it exist
        // check post
        const founded_post = await db.post.findAll({
            raw: true,
            attributes: ['post_id'],
            where: {
                post_id: request.body.parent_post_id
            }
        });

        if (founded_post == "") {
            response.json(generateRestfulResponse(404, null, "Post not found"));
            return null; // end function immediately
        }

        // check reply
        const founded_reply = await db.reply.findAll({
            raw: true,
            attributes: ['reply_id'],
            where: {
                reply_id: request.body.parent_reply_id
            }
        });

        if (founded_reply == "") {
            response.json(generateRestfulResponse(404, null, "Reply not found"));
            return null; // end function immediately
        }
    }
    // -------------------------------- verify the logic of its parent --------------------------------


    // verify other require fields
    if (request.body.reply_text === "" || request.body.reply_time === "") {
        response.json(generateRestfulResponse(400, null, "Required value missing (text or time)"));
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
            // generate uuid
            const generated_uuid = uuid.v4();

            // convert empty to null
            var parent_reply_id;
            if (request.body.parent_reply_id == "") {
                parent_reply_id = null;
            } else {
                parent_reply_id = request.body.parent_reply_id;
            }

            // add user
            const post = await db.reply.create({
                user_id: request.body.user_id,
                parent_post_id: request.body.parent_post_id,
                parent_reply_id: parent_reply_id,
                reply_id: generated_uuid,
                reply_text: sanitizeHtml(request.body.reply_text),
                reply_time: request.body.reply_time,
                is_del: "0"
            });

            response.json(generateRestfulResponse(200, post, "Reply successful"));
        }
    }
};


// delete a reply
exports.delete = async (request, response) => {
    if (request.body.reply_id == "") {
        response.json(generateRestfulResponse(400, null, "Reply ID not specify"));

    } else if (request.body.is_del === "" || request.body.is_del > 1) {
        response.json(generateRestfulResponse(400, null, "Is delete should be 0 or 1"));

    } else {
        const reply = await db.reply.update({is_del: request.body.is_del}, {
            raw: true,
            where: {
                reply_id: request.body.reply_id
            }
        });


        if (reply[0] == "") {
            response.json(generateRestfulResponse(404, null, "Reply not found (Or it is already delete)"));

        } else {
            response.json(generateRestfulResponse(200, null, "Success"));

        }

    }
};
