import {changeEmail, changeName, createUsers, deleteAccount, verifyUser, getUserDetail} from "../data/repository";
import React from "react";
import axios from "axios";
const API_HOST = "http://localhost:40003";


// Global data for tests.
let response;
let users; //user for testing
let userid; //user id of the result
let userid2; //user id of the result
let newUserName;
let newEmail;


// Runs once before tests, here global test data is initialised.
beforeAll(async () => {
    users = [
        {username: "mark", password: "Mark_123456", email: "mark@loop_agile.com"},
        {username: "kevin", password: "Kevin_123456", email: "kevin@loop_agile.com"}
    ];
    newUserName = "Jason";
    newEmail = "jason@loop_agile.com"
});


test("Create user", async () => {
    response = await createUsers(users[1]['username'], users[1]['password'], users[1]['email']);
    userid = response.data;
    expect(response.code).toBe(200);
});


test("Create user with duplicate username", async () => {
    response = await createUsers(users[1]['username'], users[1]['password'], users[1]['email']);
    expect(response.code).toBe(400);
});


test("Edit username", async () => {
    response = await changeName(userid, newUserName);
    // once change without error, true will be return
    expect(response).toBe(true);

    // when verify user with its new username, request should be success
    response = await verifyUser(newUserName, users[1]['password']);
    expect(response.code).toBe(200);

});


test("Edit username with a exist username", async () => {
    // create a user named kevin
    response = await createUsers(users[1]['username'], users[1]['password'], users[1]['email']);
    userid2 = response.data;

    // change mark's username to kevin
    response = await changeName(userid, "kevin");
});


test("Edit email", async () => {
    response = await changeEmail(userid, newEmail);

    // once change without error, true will be return
    expect(response).toBe(true);

    // when verify user with its new username, request should be success
    response = await getUserDetail(userid);
    expect(response.data.email).toBe(newEmail);
});


// clean up and delete all the created test user
afterAll(async () => {
    let data;

    // destroy user from api
    data = {
        user_id: userid
    }
    await axios.post(API_HOST + "/api/v1/users/remove", data);

    // destroy user from api
    data = {
        user_id: userid2
    }
    await axios.post(API_HOST + "/api/v1/users/remove", data);
});
