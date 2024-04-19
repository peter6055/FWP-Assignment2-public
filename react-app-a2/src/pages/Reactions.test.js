import {createUsers, setReaction, createPost, getUser} from "../data/repository";
import React from "react";
import axios from "axios";
const API_HOST = "http://localhost:40003";


// Global data for tests.
let response;
let users; //user data for testing
let post; //post data for testing
let userid; //user id of the result
let postid; //post id of the result

// Runs once before tests, here global test data is initialised.
beforeAll(async () => {
    users = [
        {username: "mark", password: "Mark_123456", email: "mark@loop_agile.com"},
        {username: "kevin", password: "Kevin_123456", email: "kevin@loop_agile.com"}
    ];

    post = [{
        text: '<h2><strong><em><u>This is a test images post</u></em></strong></h2>',
        images: [
            {
                uid: "rc-upload-1665410295790-7",
                name: "flowers-276014__340.jpg",
                status: "done",
                url: "https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/rc-upload-1665410295790-7.jpeg"
            },{
                uid: "rc-upload-1665410295790-10",
                name: "istockphoto-1368264124-170667a.jpg",
                status: "done",
                url: "https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/rc-upload-1665410295790-10.jpeg"
            },{
                uid: "rc-upload-1665410295790-11",
                name: "istockphoto-1322277517-612x612.jpg",
                status: "done",
                url: "https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/rc-upload-1665410295790-11.jpeg"
            },{
                uid: "rc-upload-1665410295790-19",
                name: "beautiful-rain-forest-ang-ka-nature-trail-doi-inthanon-national-park-thailand-36703721.jpg",
                status: "done",
                url:"https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/rc-upload-1665410295790-19.jpeg"
            }]
    }
    ]
});


test("Reaction to a post", async () => {

    //create a user first
    response = await createUsers(users[0]['username'], users[0]['password'], users[0]['email']);
    userid = response.data;

    //then create a post
    response = await createPost(userid, post[0]['text'], post[0]['images']);
    postid = response.data.post_id;



    //set a reaction, 10=like, first assertion, should response 200 ok
    response = await setReaction(userid, postid, "star");
    expect(response.response).toContain("OK");


    //verify result
    const data = {
        user_id: userid,
        target_id: postid
    }

    response = await axios.post(API_HOST + "/api/v1/reactions/getUserReactionOfTarget", data);

    expect(response.data.data.reaction.like).toContain("false");
    expect(response.data.data.reaction.dislike).toContain("false");
    expect(response.data.data.reaction.star).toContain("true");
});

// clean up and delete all the created test user
afterAll(async () => {
    let data;

    // destroy reaction from api
    data = {
        user_id: userid,
        target_id: postid,
        reaction: 30
    }
    await axios.post(API_HOST + "/api/v1/reactions/setUserReactionOnTarget", data);


    // destroy post from api
    data = {
        post_id: postid
    }
    await axios.post(API_HOST + "/api/v1/posts/remove", data);


    // destroy user from api
    data = {
        user_id: userid
    }
    await axios.post(API_HOST + "/api/v1/users/remove", data);

});