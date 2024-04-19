const db = require("../database");
const argon2 = require("argon2");
const generateRestfulResponse = require("../routes/restful.js")
var uuid = require('uuid');


// Select one user from the database if username and password are a match.
exports.login = async (request, response) => {

    // end and post error when there are no value
    if(request.body.username == "" || request.body.password == ""){
        response.json(generateRestfulResponse(400, null, "Please enter username and password"));
        return null; // end immediately
    }

    const user = await db.user.findAll({
        raw: true,
        where: {
            username: request.body.username
        }
    });


    if(user == ""){
        response.json(generateRestfulResponse(403, null, "Username or password incorrect"));
        return null; // end immediately

    } else if (await argon2.verify(user[0].password, request.body.password) === false) {
        // Login failed.
        response.json(generateRestfulResponse(403, null, "Username or password incorrect"));
        return null; // end immediately

    } else {

        if (user[0]['is_del']) {
            response.json(generateRestfulResponse(404, null, "Username had been deleted! Please contact administrator if you believe this is a mistake"));
            return null; // end immediately

        } else {
            const user = await db.user.findAll({
                attributes: ['user_id'],
                where: {
                    username: request.body.username
                }
            });

            response.json(generateRestfulResponse(200, user[0], "Welcome " + request.body.username + "!"));

        }
    }

};


// Create a user in the database.
exports.create = async (request, response) => {
    if (request.body.username === "" || request.body.password === "" || request.body.email === "" || request.body.join_date === "") {
        response.json(generateRestfulResponse(400, null, "Required value missing"));

    } else {
        // check is username duplication
        const founded_username = await db.user.findAll({
            raw: true,
            where: {
                username: request.body.username
            }
        });

        if (founded_username == "") {
            // do hash password
            const hash = await argon2.hash(request.body.password, {type: argon2.argon2id});

            // generate uuid
            const generated_uuid = uuid.v4();

            // add user
            await db.user.create({
                user_id: generated_uuid,
                username: request.body.username,
                password: hash,
                email: request.body.email,
                join_date: request.body.join_date,
                mfa_status: "0",
                is_del: "0"
            });

            response.json(generateRestfulResponse(200, generated_uuid, "Welcome " + request.body.username + "!"));

        } else {
            response.json(generateRestfulResponse(400, null, "Username exist"));

        }

    }
};


// Edit username and email
exports.edit = async (request, response) => {

    if (request.body.user_id == "") {
        response.json(generateRestfulResponse(400, null, "User ID invalid"));

    } else if (request.body.new_username == "" || request.body.new_email == "") {
        response.json(generateRestfulResponse(400, null, "New username or email cannot be empty"));

    } else {

        const exists_user = await db.user.findAll({
            raw: true,
            where: {
                user_id: request.body.user_id
            }
        });

        // check is user exist
        if (exists_user == "") {
            response.json(generateRestfulResponse(404, null, "User not found"));

        } else {

            // check is username duplication
            const founded_username = await db.user.findAll({
                raw: true,
                where: {
                    username: request.body.new_username
                }
            });

            if (founded_username == "" || founded_username[0]['user_id'] === request.body.user_id) {
                await db.user.update({username: request.body.new_username, email: request.body.new_email}, {
                    raw: true,
                    where: {
                        user_id: request.body.user_id
                    }
                });

                const user_fetch = await db.user.findAll({
                    raw: true,
                    attributes: ['user_id', 'username', 'email', 'join_date', 'mfa_status'],
                    where: {
                        user_id: request.body.user_id
                    }
                });

                response.json(generateRestfulResponse(200, user_fetch[0], "Success"));

            } else {
                response.json(generateRestfulResponse(400, null, "Username exist"));

            }
        }
    }


};


// Select one user from the database.
exports.detail = async (request, response) => {
    const user = await db.user.findAll({
        raw: true,
        attributes: ['user_id', 'username', 'email', 'join_date', 'mfa_status'],
        where: {
            user_id: request.body.user_id
        }
    });

    if (user == "") {
        response.json(generateRestfulResponse(404, null, "User not found"));

    } else {
        response.json(generateRestfulResponse(200, user[0], "Success"));
    }

};


// Delete user
exports.delete = async (request, response) => {
    if (request.body.user_id == "") {
        response.json(generateRestfulResponse(400, null, "User ID not specify"));

    } else if (request.body.is_del === "" || request.body.is_del > 1) {
        response.json(generateRestfulResponse(400, null, "Is delete should be 0 or 1"));

    } else {
        const user = await db.user.update({is_del: request.body.is_del}, {
            raw: true,
            where: {
                user_id: request.body.user_id
            }
        });

        if (user[0] == "") {
            response.json(generateRestfulResponse(404, null, "User not found"));

        } else {
            response.json(generateRestfulResponse(200, null, "Success"));

        }

    }
};


// remove(destroy) user: for testing purpose
exports.remove = async (request, response) => {
    if (request.body.user_id == "") {
        response.json(generateRestfulResponse(400, null, "User ID not specify"));

    } else {
        const user = await db.user.destroy({
            where: {
                user_id: request.body.user_id
            }
        });

        if (user[0] == "") {
            response.json(generateRestfulResponse(404, null, "User not found"));

        } else {
            response.json(generateRestfulResponse(200, null, "Success"));

        }

    }
};