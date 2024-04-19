const db = require("../database");
const generateRestfulResponse = require("../routes/restful.js")
var uuid = require('uuid');
const {Op} = require("sequelize");

// reaction mapping
// 10 => like
// 20 => dislike
// 30 => star


// get reaction count from target (reply/post)
exports.getCountFromTarget = async (request, response) => {
    // -------------------- check require attributes --------------------
    if (request.body.target_id == "") {
        response.json(generateRestfulResponse(400, null, "Missing require attributes"));
        return null; // end function immediately
    }

    // -------------------- start count --------------------
    var reaction_count_result = new Array();

    // three reaction
    for (var reactionCount = 1; reactionCount < 4; reactionCount++) {
        const reaction_count = await db.reaction.count({
            raw: true,
            group: 'reaction',
            where: {
                [Op.and]: {
                    [Op.or]: [{post_id: request.body.target_id}, {reply_id: request.body.target_id}],

                    // reaction id is 10, 20, 30
                    reaction: reactionCount * 10
                }
            }
        });


        // if there are no reaction, then store zero, otherwise get count result.
        // store the result in the sequence position
        if (reaction_count == "") {
            reaction_count_result[reactionCount] = 0;
        } else {
            reaction_count_result[reactionCount] = reaction_count[0]['count']
        }
    }


    // prepare result
    let result =
        "{" +
        "\"target_id\":\"" + request.body.target_id + "\"," +
        "\"reaction_count\":{" +
        "\"like\":\"" + reaction_count_result[1] + "\"," +
        "\"dislike\":\"" + reaction_count_result[2] + "\"," +
        "\"star\":\"" + reaction_count_result[3] + "\"" +
        "}" +
        "}";

    response.json(generateRestfulResponse(200, JSON.parse(result), ""));
};


// get user's reaction to a target (reply/post)
exports.getUserReactionOfTarget = async (request, response) => {
    // -------------------- check require attributes --------------------
    if (request.body.user_id == "" || request.body.target_id == "") {
        response.json(generateRestfulResponse(400, null, "Missing require attributes"));
        return null; // end function immediately
    }


    const find_result = await db.reaction.findAll({
        raw: true,
        where: {
            [Op.and]: {
                [Op.or]: [{post_id: request.body.target_id}, {reply_id: request.body.target_id}],
                user_id: request.body.user_id
            }
        }
    });


    // -------------------- data finalise --------------------
    // mapping the reaction
    var reaction_like = false;
    var reaction_dislike = false;
    var reaction_star = false;


    if (find_result != "") {

        switch (find_result[0]['reaction']) {
            case 10:
                reaction_like = true;
                break;

            case 20:
                reaction_dislike = true;
                break;

            case 30:
                reaction_star = true;
                break;
        }
    }


    // prepare result
    let result =
        "{" +
        "\"user_id\":\"" + request.body.user_id + "\"," +
        "\"target_id\":\"" + request.body.target_id + "\"," +
        "\"reaction\":{" +
        "\"like\":\"" + reaction_like + "\"," +
        "\"dislike\":\"" + reaction_dislike + "\"," +
        "\"star\":\"" + reaction_star + "\"" +
        "}" +
        "}";

    response.json(generateRestfulResponse(200, JSON.parse(result), ""));
};

// set user's reaction of a target (reply/post)
exports.setUserReactionOnTarget = async (request, response) => {
    // -------------------- init storage first --------------------
    var user_id;
    var target_id;
    var reaction;

    var post_id;
    var reply_id

    // -------------------- check require attributes --------------------
    if (request.body.user_id == "" || request.body.reaction == "" || request.body.target_id == "") {
        response.json(generateRestfulResponse(400, null, "Missing require attributes"));
        return null; // end function immediately

    } else {


        // then check reaction input correct
        if (request.body.reaction !== 10 && request.body.reaction !== 20 && request.body.reaction !== 30) {
            response.json(generateRestfulResponse(400, null, "Reaction not correct (Should be 10,20 or 30), make sure their are in INT format."));
            return null; // end function immediately

        }

        // then put value into variable
        user_id = request.body.user_id;
        target_id = request.body.target_id;
        reaction = request.body.reaction;
    }


    // -------------------- check is user exist --------------------
    const exist_user = await db.user.findAll({
        raw: true,
        where: {
            user_id: user_id
        }
    });

    // user not found
    if (exist_user == "") {
        response.json(generateRestfulResponse(404, null, "User not found"));
        return null; // end function immediately
    }


    // -------------------- check is target exist --------------------
    // get post and reply
    const exist_post = await db.post.findAll({
        raw: true,
        where: {
            post_id: target_id
        }
    });

    const exist_reply = await db.reply.findAll({
        raw: true,
        where: {
            reply_id: target_id
        }
    });

    // to store founded result
    var founded_reaction;

    // start identifying
    if (exist_post != "") {
        founded_reaction = await db.reaction.findAll({
            raw: true,
            where: {
                [Op.and]: [{post_id: target_id}, {user_id: user_id}]
            }
        });

        // post exist, so it is a post. reply is null
        post_id = target_id;
        reply_id = null;

    } else if (exist_reply != "") {
        founded_reaction = await db.reaction.findAll({
            raw: true,
            where: {
                [Op.and]: [{reply_id: target_id}, {user_id: user_id}]
            }
        });

        // reply exist, so it is a reply. post is null
        post_id = null;
        reply_id = target_id;

    } else {
        // kill session, nothings exist
        response.json(generateRestfulResponse(404, null, "Post or reply not found"));
        return null; // end function immediately
    }


    // -------------------- reaction logic --------------------
    if (founded_reaction == "") {
        // no reaction => create a reaction
        await db.reaction.create({
            id: uuid.v4(),
            user_id: user_id,
            post_id: post_id,
            reply_id: reply_id,
            reaction: reaction
        });

    } else if (founded_reaction != "" && founded_reaction[0]['reaction'] !== reaction) {
        // have reaction, clicking different reaction => change reaction
        await db.reaction.update({reaction: reaction}, {
            raw: true,
            where: {
                id: founded_reaction[0]['id']
            }
        });


    } else if (founded_reaction != "" && founded_reaction[0]['reaction'] === reaction) {
        // have reaction, clicking same reaction => remove reaction
        await db.reaction.destroy({
            where: {
                id: founded_reaction[0]['id']
            }
        });

        // clicking the same reaction means clear all the reaction record
        reaction = 0;
    }


    // -------------------- data finalise --------------------
    // mapping the reaction
    var reaction_like = false;
    var reaction_dislike = false;
    var reaction_star = false;


    switch (reaction) {
        case 10:
            reaction_like = true;
            break;

        case 20:
            reaction_dislike = true;
            break;

        case 30:
            reaction_star = true;
            break;
    }

    // prepare result
    let result =
        "{" +
        "\"user_id\":\"" + user_id + "\"," +
        "\"target_id\":\"" + target_id + "\"," +
        "\"reaction\":{" +
        "\"like\":\"" + reaction_like + "\"," +
        "\"dislike\":\"" + reaction_dislike + "\"," +
        "\"star\":\"" + reaction_star + "\"" +
        "}" +
        "}";

    response.json(generateRestfulResponse(200, JSON.parse(result), ""));

};

