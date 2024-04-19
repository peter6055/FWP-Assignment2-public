const db = require("../database");
const generateRestfulResponse = require("../routes/restful.js")
var uuid = require('uuid');
const sanitizeHtml = require('sanitize-html');
const {Sequelize} = require("sequelize");


// get all posts
exports.getAll = async (request, response) => {

    const post = await db.post.findAll({
        raw: true,
        where: {
            is_del: 0
        },
        order: [
            [Sequelize.literal('createdAt'), 'DESC']
        ]
    });

    if (post == "") {
        // Login failed.
        response.json(generateRestfulResponse(404, null, "No Post Found"));
    } else {
        response.json(generateRestfulResponse(200, post, ""));
    }

};


// get all post from user id
exports.getAllFromUserId = async (request, response) => {

    // check is there any user id
    if (request.body.user_id == "") {
        response.json(generateRestfulResponse(400, null, "Please pass user ID or call getAll instead."));
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

            // get the post belongs to user and is not delete
            const post = await db.post.findAll({
                raw: true,
                where: {
                    user_id: request.body.user_id,
                    is_del: 0
                },
                order: [
                    [Sequelize.literal('createdAt'), 'DESC']
                ]
            });

            // identify is there any posy made by this user
            if (post == "") {
                response.json(generateRestfulResponse(404, null, "No Post Found"));

            } else {

                response.json(generateRestfulResponse(200, post, "OK"));

            }
        }

    }


};


// get a posts
exports.getSingle = async (request, response) => {
    if (request.body.post_id == "") {
        response.json(generateRestfulResponse(400, null, "Post ID not specify"));

    } else {
        const post = await db.post.findAll({
            raw: true,
            where: {
                post_id: request.body.post_id,
                is_del: 0
            }
        });

        if (post == "") {
            // Login failed.
            response.json(generateRestfulResponse(404, null, "No Post Found"));

        } else {
            response.json(generateRestfulResponse(200, post, ""));

        }
    }
};


// remove(destroy) post: for testing purpose
exports.create = async (request, response) => {
    // verify require fields
    if (request.body.post_text === "" || request.body.post_time === "") {
        response.json(generateRestfulResponse(400, null, "Required value missing"));

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

        } else {
            // generate uuid
            const generated_uuid = uuid.v4();

            // add user
            const post = await db.post.create({
                user_id: request.body.user_id,
                post_id: generated_uuid,
                post_text: sanitizeHtml(request.body.post_text),
                post_img: request.body.post_img,
                post_time: request.body.post_time,
                is_del: "0"
            });

            response.json(generateRestfulResponse(200, post, "Post successful"));
        }
    }
};


// Edit post
exports.edit = async (request, response) => {

    if (request.body.post_id == "") {
        response.json(generateRestfulResponse(400, null, "Post ID invalid"));

    } else if (request.body.new_post_text == "") {
        response.json(generateRestfulResponse(400, null, "New text cannot be empty"));

    } else {
        const exists_post = await db.post.findAll({
            raw: true,
            where: {
                post_id: request.body.post_id,
                is_del: 0
            }
        });

        // check is post exist
        if (exists_post == "") {
            response.json(generateRestfulResponse(404, null, "Post not found"));

        } else {
            await db.post.update({post_text: sanitizeHtml(request.body.new_post_text)}, {
                raw: true,
                where: {
                    post_id: request.body.post_id
                }
            });

            const fetch_post = await db.post.findAll({
                raw: true,
                where: {
                    post_id: request.body.post_id
                }
            });

            response.json(generateRestfulResponse(200, fetch_post[0], "Success"));

        }
    }


};


// delete a post
exports.delete = async (request, response) => {
    if (request.body.post_id == "") {
        response.json(generateRestfulResponse(400, null, "Post ID not specify"));

    } else if (request.body.is_del === "" || request.body.is_del > 1) {
        response.json(generateRestfulResponse(400, null, "Is delete should be 0 or 1"));

    } else {
        const post = await db.post.update({is_del: request.body.is_del}, {
            raw: true,
            where: {
                post_id: request.body.post_id
            }
        });

        if (post[0] == "") {
            response.json(generateRestfulResponse(404, null, "Post not found"));

        } else {
            response.json(generateRestfulResponse(200, null, "Success"));

        }

    }
};



// remove(destroy) a post
exports.remove = async (request, response) => {
    if (request.body.post_id == "") {
        response.json(generateRestfulResponse(400, null, "Post ID not specify"));

    } else {
        const post = await db.post.destroy({
            where: {
                post_id: request.body.post_id
            }
        });

        if (post[0] == "") {
            response.json(generateRestfulResponse(404, null, "Post not found"));

        } else {
            response.json(generateRestfulResponse(200, null, "Success"));

        }

    }
};
