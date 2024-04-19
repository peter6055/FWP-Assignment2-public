import {stringify, v4 as uuidv4} from 'uuid';
import {
    message,
    Avatar,
    Button,
    Typography,
    Divider,
    Popconfirm,
    Row,
    Col,
    Comment,
    Card,
    Image,
    Modal,
    Form,
    Input,
    Alert,
    AutoComplete, Empty, Spin
} from "antd";
import {
    QuestionCircleOutlined,
    LikeFilled,
    DislikeFilled,
    StarFilled,
    PlusCircleFilled,
    MinusCircleFilled,
    CloseCircleFilled
} from '@ant-design/icons';
import axios from "axios";
import $ from 'jquery';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


// --- Constants ----------------------------------------------------------------------------------
const API_HOST = "http://localhost:40003";
const USER_KEY = "user";


// creating
async function createUsers(username, password, email) {
    //generate time
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    let day = days[d.getDay()];
    let date = d.getDate()
    let month = months[d.getMonth()] + 1;
    let year = d.getFullYear();
    const JoinDate = `${day} ${date} ${month} ${year}`;
    const user =
        {
            username: username,
            password: password,
            email: email,
            join_date: JoinDate,
        };
    const response = await axios.post(API_HOST + "/api/v1/users/create", user);

    return response.data;
}

async function createPost(userId, text, images) {
    //generate image datta
    const ImageData = [];
    for (const image of images) {
        ImageData.push(image);
    }
    const d = new Date();
    let date = d.getDate()
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let hour = d.getHours();
    let minutes = d.getMinutes()
    const post_time = `${year}-${month}-${date} ${hour}:${minutes}`;
    const post = {
        user_id: userId,
        post_text: text,
        post_img: JSON.stringify(ImageData),
        post_time: post_time
    }
    const response = await axios.post(API_HOST + "/api/v1/posts/create", post);

    return response.data;
}

async function createReply(userId, post_id, reply_id, text) {
    const d = new Date();
    let date = d.getDate()
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    let hour = d.getHours();
    let minutes = d.getMinutes()
    const reply_time = `${year}-${month}-${date} ${hour}:${minutes}`;
    const reply = {
        user_id: userId,
        parent_post_id: post_id,
        parent_reply_id: reply_id,
        reply_text: text,
        reply_time: reply_time
    }
    const response = await axios.post(API_HOST + "/api/v1/replies/create", reply);
    return response.data;
}


async function getPosts() {
    const response = await axios.get(API_HOST + "/api/v1/posts/getAll");
    return response.data;
}


// // NOTE: In this example the login is also persistent as it is stored in local storage.
async function verifyUser(username, password) {
    const data = {
        username: username,
        password: password
    }
    const response = await axios.post(API_HOST + "/api/v1/users/login", data);
    return response.data;
}

function setUser(id) {
    localStorage.setItem(USER_KEY, JSON.stringify(id));
}

async function getUserDetail(id) {
    const data = {
        user_id: id
    }
    const response = await axios.post(API_HOST + "/api/v1/users/detail", data);
    return response.data;
}

function getUser() {
    let data = localStorage.getItem(USER_KEY);
    return JSON.parse(data)
}

function removeUser() {
    localStorage.removeItem(USER_KEY);
}

async function changeName(id, newUsername) {
    const userDetail = await getUserDetail(id);
    const data = {
        user_id: id,
        new_username: newUsername,
        new_email: userDetail.data.email
    }
    const response = await axios.post(API_HOST + "/api/v1/users/edit", data);
    if (response.data.success) {
        return true
    } else {
        message.error({
            content: response.data.message,
        });
    }
}

async function changeEmail(id, newEmail) {
    if (/\S+@\S+\.\S+/.test(newEmail)) {
        const userDetail = await getUserDetail(id);
        const data = {
            user_id: id,
            new_username: userDetail.data.username,
            new_email: newEmail
        }
        const response = await axios.post(API_HOST + "/api/v1/users/edit", data);
        if (response.data.success) {
            return true
        } else {
            message.error({
                content: response.data.message,
            });
        }
    } else {
        message.error({
            content: 'Please input a valid email address',
        });
    }
}

async function deleteAccount(id) {
    const data = {
        user_id: id,
        is_del: "1"
    }
    await axios.post(API_HOST + "/api/v1/users/delete", data);
    const getUserPostsId = {
        user_id: id
    }
    const response = await axios.post(API_HOST + "/api/v1/posts/getAllFromUserId", getUserPostsId);
    //get all post from this user and delete
    const posts = response.data.data
    for (const post of posts) {
        await deleteProfilePost(post.post_id);
    }
    removeUser();
}

// generate post and reply depends on all the post
async function printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit) {
    let print = [];
    const data = {
        user_id: getUser()
    }
    //get this user's userID， get all followed user id.
    const getFollowedUser = await axios.post(API_HOST + "/api/v1/follows/getFollowersFromUserId", data);
    const FollowedUses = getFollowedUser.data.data;
    const getPosts = await axios.get(API_HOST + "/api/v1/posts/getAll");
    const posts = getPosts.data.data
    if (posts != null) {
        for (const post of posts) {
            const userDetail = await getUserDetail(post.user_id)
            const id = post.user_id;
            const post_id = post.post_id;
            // generate image tags depends on local storage
            const imageTag = [];
            const images = JSON.parse(post.post_img);
            for (const image of images) {
                let URL = image.url;
                imageTag.push(<Image className={"center-cropped"} width={"12vh"} src={URL}/>);
            }
            //if Id is exist then follow is true
            let follow = false;
            if (FollowedUses != null) {
                for (const FollowedUse of FollowedUses) {
                    if (FollowedUse.followed_user_id === post.user_id) {
                        follow = true;
                    }
                }
            }
            //get reaction
            const targetId = {
                target_id: post_id
            }
            const clickedData = {
                user_id: getUser(),
                target_id: post_id
            }
            const getReactionAccount = await axios.post(API_HOST + "/api/v1/reactions/getCountFromTarget", targetId);
            const ReactionAccount = getReactionAccount.data.data.reaction_count;
            const getReactionClicked = await axios.post(API_HOST + "/api/v1/reactions/getUserReactionOfTarget", clickedData);
            const ReactionClicked = getReactionClicked.data.data.reaction;
            const likeClicked = ReactionClicked.like;
            const dislikeClicked = ReactionClicked.dislike;
            const starClicked = ReactionClicked.star;
            print.push(
                <Card style={{width: "100%", marginTop: "12px"}}>
                    <Comment
                        actions={[
                            <div>
                        <span key="comment-nested-reply-to" className={"reply"} onClick={handleReplyOnClick}
                              style={{cursor: "pointer"}}>
                            Reply
                            <replyinput style={{display: "none"}}>
                                <Comment
                                    avatar={
                                        <Avatar alt={userDetail.data.username} className={"postAvatar"} size="default"
                                                style={{
                                                    backgroundColor: "#f56a00",
                                                    verticalAlign: 'middle',
                                                    fontSize: '17px'
                                                }}>
                                            {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                                        </Avatar>
                                    }
                                    content={
                                        <div className={"reply-input-box"}>
                                            <Form.Item>

                                                <ReactQuill id="postTextItem" theme="snow"
                                                            placeholder={"Write a post..."}></ReactQuill>

                                            </Form.Item>
                                            <Form.Item>
                                                <Button htmlType="submit" style={{marginTop: "10px"}}
                                                        parent_post_id={post_id}
                                                        parent_reply_id={""}
                                                        onClick={handleReplySubmit}
                                                        type="primary">Reply</Button>
                                            </Form.Item>
                                        </div>
                                    }
                                >
                                </Comment>
                            </replyinput>
                        </span>
                                <br/><br/>
                                <Spin spinning={true} style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "300px", "display": "none", "padding": "25px 0px", "marginTop": "-23px"}}></Spin>
                                    {(likeClicked == "true") ?
                                        <span className={"reaction reaction-like reaction-has-like"}
                                              style={{cursor: "pointer"}} reaction={"like"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>
                                        :

                                        <span className={"reaction reaction-like"} style={{cursor: "pointer"}}
                                              reaction={"like"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>

                                    }
                                    {(dislikeClicked == "true") ?
                                        <span className={"reaction reaction-dislike  reaction-has-dislike"}
                                              style={{cursor: "pointer"}}
                                              reaction={"dislike"} target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>
                                        :
                                        <span className={"reaction reaction-dislike"} style={{cursor: "pointer"}}
                                              reaction={"dislike"} target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>}
                                    {(starClicked == "true") ?
                                        <span className={"reaction reaction-star reaction-has-star"}
                                              style={{cursor: "pointer"}} reaction={"star"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>
                                        :
                                        <span className={"reaction reaction-star"} style={{cursor: "pointer"}}
                                              reaction={"star"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>}

                            </div>
                        ]}
                        author={<a>{userDetail.data.username}</a>}
                        avatar={<Avatar alt={userDetail.data.username} className={"postAvatar"} size="default" style={{
                            backgroundColor: "#f56a00",
                            verticalAlign: 'middle',
                            fontSize: '17px'
                        }}>
                            {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                        </Avatar>}
                        content={
                            <div>
                                <p>
                                    <div dangerouslySetInnerHTML={{__html: post.post_text}}></div>
                                </p>
                                <div className={"postImageGroup"}>
                                    {imageTag}
                                </div>
                            </div>
                        }
                        datetime={
                            <div>
                                <div style={{display: "flex"}} className={"control-tab"}>
                                    {post.post_time}
                                    <Spin spinning={true} tip="Loading..." style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "164px", "display": "none", "padding": "22px 0px", "marginTop": "-23px", "z-index": "100000","right": "0px"}}></Spin>
                                    {follow ?
                                        <div className={"follow-btn has-follow"}
                                             style={{position: "absolute", right: 0, top: 0}}
                                             user_id={id} action={"unfollow"} username={userDetail.data.username}
                                             onClick={handleFollowSubmit}><CloseCircleFilled/> Unfollow
                                        </div>
                                        :
                                        <div className={"follow-btn"} style={{position: "absolute", right: 0, top: 0}}
                                             user_id={id} action={"follow"} username={userDetail.data.username}
                                             onClick={handleFollowSubmit}><PlusCircleFilled/> Follow
                                            @{userDetail.data.username}</div>
                                    }

                                </div>
                            </div>
                        }
                    >

                        {await printPostReplys(post_id, handleReplyOnClick, handleReplySubmit, handleReactionSubmit)}
                    </Comment>
                </Card>
            );
        }
    }
    return <div>{print}</div>;
}

async function printFollowingPost(FollowedId, handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit) {
    let print = [];
    const data = {
        user_id: getUser()
    }
    //get this user's userID， get all followed user id.
    const getFollowedUser = await axios.post(API_HOST + "/api/v1/follows/getFollowersFromUserId", data);
    const FollowedUses = getFollowedUser.data.data;
    const getUserPostsId = {
        user_id: FollowedId
    }
    const getPosts = await axios.post(API_HOST + "/api/v1/posts/getAllFromUserId", getUserPostsId);
    const posts = getPosts.data.data
    if (posts != null) {
        for (const post of posts) {
            const userDetail = await getUserDetail(post.user_id)
            const id = post.user_id;
            const post_id = post.post_id;
            // generate image tags depends on local storage
            const imageTag = [];
            const images = JSON.parse(post.post_img);
            for (const image of images) {
                let URL = image.url;
                imageTag.push(<Image className={"center-cropped"} width={"12vh"} src={URL}/>);
            }
            //if Id is exist then follow is true
            let follow = false;
            if (FollowedUses != null) {
                for (const FollowedUse of FollowedUses) {
                    if (FollowedUse.followed_user_id === post.user_id) {
                        follow = true;
                    }
                }
            }
            //get reaction
            const targetId = {
                target_id: post_id
            }
            const clickedData = {
                user_id: getUser(),
                target_id: post_id
            }
            const getReactionAccount = await axios.post(API_HOST + "/api/v1/reactions/getCountFromTarget", targetId);
            const ReactionAccount = getReactionAccount.data.data.reaction_count;
            const getReactionClicked = await axios.post(API_HOST + "/api/v1/reactions/getUserReactionOfTarget", clickedData);
            const ReactionClicked = getReactionClicked.data.data.reaction;
            const likeClicked = ReactionClicked.like;
            const dislikeClicked = ReactionClicked.dislike;
            const starClicked = ReactionClicked.star;
            print.push(
                <Card style={{width: "100%", marginTop: "12px"}}>
                    <Comment
                        actions={[
                            <div>
                        <span key="comment-nested-reply-to" className={"reply"} onClick={handleReplyOnClick}
                              style={{cursor: "pointer"}}>
                            Reply
                            <replyinput style={{display: "none"}}>
                                <Comment
                                    avatar={
                                        <Avatar alt={userDetail.data.username} className={"postAvatar"} size="default"
                                                style={{
                                                    backgroundColor: "#f56a00",
                                                    verticalAlign: 'middle',
                                                    fontSize: '17px'
                                                }}>
                                            {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                                        </Avatar>
                                    }
                                    content={
                                        <div className={"reply-input-box"}>
                                            <Form.Item>

                                                <ReactQuill id="postTextItem" theme="snow"
                                                            placeholder={"Write a post..."}></ReactQuill>

                                            </Form.Item>
                                            <Form.Item>
                                                <Button htmlType="submit" style={{marginTop: "10px"}}
                                                        parent_post_id={post_id}
                                                        parent_reply_id={""}
                                                        onClick={handleReplySubmit}
                                                        type="primary">Reply</Button>
                                            </Form.Item>
                                        </div>
                                    }
                                >
                                </Comment>
                            </replyinput>
                        </span>
                                <br/><br/>
                                <Spin spinning={true} style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "300px", "display": "none", "padding": "25px 0px", "marginTop": "-23px"}}></Spin>
                                {(likeClicked == "true") ?
                                        <span className={"reaction reaction-like reaction-has-like"}
                                              style={{cursor: "pointer"}} reaction={"like"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>
                                        :

                                        <span className={"reaction reaction-like"} style={{cursor: "pointer"}}
                                              reaction={"like"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>

                                    }
                                    {(dislikeClicked == "true") ?
                                        <span className={"reaction reaction-dislike  reaction-has-dislike"}
                                              style={{cursor: "pointer"}}
                                              reaction={"dislike"} target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>
                                        :
                                        <span className={"reaction reaction-dislike"} style={{cursor: "pointer"}}
                                              reaction={"dislike"} target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>}
                                    {(starClicked == "true") ?
                                        <span className={"reaction reaction-star reaction-has-star"}
                                              style={{cursor: "pointer"}} reaction={"star"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>
                                        :
                                        <span className={"reaction reaction-star"} style={{cursor: "pointer"}}
                                              reaction={"star"}
                                              target_id={post_id} target_type={"post"}
                                              onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>}
                            </div>
                        ]}
                        author={<a>{userDetail.data.username}</a>}
                        avatar={<Avatar alt={userDetail.data.username} className={"postAvatar"} size="default" style={{
                            backgroundColor: "#f56a00",
                            verticalAlign: 'middle',
                            fontSize: '17px'
                        }}>
                            {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                        </Avatar>}
                        content={
                            <div>
                                <p>
                                    <div dangerouslySetInnerHTML={{__html: post.post_text}}></div>
                                </p>
                                <div className={"postImageGroup"}>
                                    {imageTag}
                                </div>
                            </div>
                        }
                        datetime={
                            <div>
                                <div style={{display: "flex"}}>
                                    {post.post_time}
                                    <Spin spinning={true} style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "110px", "display": "none", "padding": "22px 0px", "marginTop": "-23px", "z-index": "100000","right": "0px","paddingLeft": "58px"}}></Spin>
                                    {follow ?
                                        <div className={"follow-btn has-follow"}
                                             style={{position: "absolute", right: 0, top: 0}}
                                             user_id={id} action={"unfollow"} username={userDetail.data.username}
                                             onClick={handleFollowSubmit}><CloseCircleFilled/> Unfollow
                                        </div>
                                        :
                                        <div className={"follow-btn"} style={{position: "absolute", right: 0, top: 0}}
                                             user_id={id} action={"follow"} username={userDetail.data.username}
                                             onClick={handleFollowSubmit}><PlusCircleFilled/> Follow
                                            @{userDetail.data.username}</div>
                                    }

                                </div>
                            </div>
                        }
                    >

                        {await printPostReplys(post_id, handleReplyOnClick, handleReplySubmit, handleReactionSubmit)}
                    </Comment>
                </Card>
            );
        }
    }
    return <div>{print}</div>;
}

async function printProfilePost(id, editPostOnClick, deletePost, handleEditPost) {
    let print = [];
    const getPosts = await axios.get(API_HOST + "/api/v1/posts/getAll");
    const posts = getPosts.data.data
    if (posts != null) {
        for (const post of posts) {
            //get image data
            const imageTag = [];
            const images = JSON.parse(post.post_img);
            for (const image of images) {
                let URL = image.url;
                imageTag.push(<Image className={"center-cropped"} width={"12vh"} src={URL}/>);
            }
            //check the user id in post to ensure the post is from this person
            if (post.user_id === id) {
                const userDetail = await getUserDetail(post.user_id)
                print.push(
                    <Card style={{width: "100%", marginTop: "12px"}}>
                        <Comment
                            actions={[
                                <span className={"clickable-text"} key="comment-nested-reply-to"
                                      onClick={editPostOnClick} style={{paddingLeft: "10px"}}>Edit post</span>,
                                <Popconfirm
                                    title={<div><p>You sure you want to delete this post?</p><input type={"hidden"}
                                                                                                    name="postId"
                                                                                                    value={post.post_id}></input>
                                    </div>}
                                    icon={
                                        <QuestionCircleOutlined
                                            style={{
                                                color: 'red',
                                            }}
                                        />
                                    }
                                    onConfirm={deletePost}
                                    placement="bottom"
                                    okText="Delete Forever!"
                                    cancelText="No"
                                >
                                <span className={"danger-text"} key="comment-nested-reply-to"
                                      style={{paddingLeft: "10px"}} type="danger">Delete post</span>

                                </Popconfirm>

                            ]}
                            author={<a>{userDetail.data.username}</a>}
                            avatar={<Avatar alt={userDetail.data.username} className={"postAvatar"} size="default"
                                            style={{
                                                backgroundColor: "#f56a00",
                                                verticalAlign: 'middle',
                                                fontSize: '17px'
                                            }}>
                                {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                            </Avatar>}
                            content={
                                <div>
                                    <div className={"postText"}>
                                        <p>
                                            <div dangerouslySetInnerHTML={{__html: post.post_text}}></div>
                                        </p>
                                        <ReactQuill theme="snow" placeholder={"Write a post..."}
                                                    style={{display: "none"}}
                                                    value={post.post_text}/>
                                        <Button type="primary" postId={post.post_id} onClick={handleEditPost}
                                                style={{marginTop: "20px", display: "none"}}>Save changes</Button>
                                    </div>
                                    <div className={"postImageGroup"}>
                                        {imageTag}
                                    </div>
                                </div>
                            }
                            datetime={
                                post.post_time
                            }
                        >
                            {await printProfileReplys(post.post_id)}
                        </Comment>
                    </Card>
                );
            }
        }
    }

    if (print == "") {
        print.push(
            <Card>
                <Empty description={"No Post"} style={{padding: "104px 0px"}}/>
            </Card>
        )
    }

    return <div>{print}</div>;
}

async function printFollow(handleFollowSubmit) {
    let print = [];
    const input = {
        user_id: getUser()
    }
    //get all the followed user
    const getFollowedUser = await axios.post(API_HOST + "/api/v1/follows/getFollowersFromUserId", input);
    const FollowedUses = getFollowedUser.data.data;
    if (FollowedUses != null) {
        for (const FollowedUse of FollowedUses) {
            const userDetail = await getUserDetail(FollowedUse.followed_user_id);
            print.push(
                <div style={{display: "flex", alignItems: "center", margin: "0px 0px 25px 0px"}}>
                    <Spin spinning={true} style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "221px", "display": "none", "padding": "22px 0px", "z-index": "100000"}}></Spin>
                    <Avatar
                        style={{
                            backgroundColor: "rgb(245, 106, 0)",
                            verticalAlign: 'middle',
                        }}
                        size="large"
                        gap={5}
                    >
                        {JSON.stringify(userDetail.data.username).charAt(1).toUpperCase()}
                    </Avatar>
                    <span style={{marginLeft: "10px"}}>{userDetail.data.username}</span>
                    <Button
                    size="small"
                    icon={<MinusCircleFilled/>}
                    style={{
                        margin: '0 16px',
                        verticalAlign: 'middle',
                        position: "inherit",
                        right: "0px",
                        top: "0px",
                        padding: "0px 5px 0px 5px",
                        marginLeft: "auto"
                    }}
                    user_id={FollowedUse.followed_user_id} username={userDetail.data.username}
                    onClick={handleFollowSubmit}
                    className={"follow-btn"}
                >
                    Unfollow
                </Button>
                </div>
            )
        }
    } else {
        print.push(
            <div style={{display: "flex", alignItems: "center", margin: "0px 0px 25px 0px"}}>
                <Empty description={"No Followed"} style={{padding: "63px 0px"}}/>
            </div>
        )
    }
    return <div>{print}</div>;
}

async function printPostReplys(parentId, handleReplyOnClick, handleReplySubmit, handleReactionSubmit) {
    const getReplys = await axios.get(API_HOST + "/api/v1/replies/getAll");
    const replys = getReplys.data.data
    let print = [];
    if (replys != null) {
        for (const reply of replys) {
            //only the reply's parent id is same and reply id is null, means this reply is under post
            //only reply id is same as parent id, means this reply is under other reply
            if (reply.parent_post_id === parentId && reply.parent_reply_id === null || reply.parent_reply_id === parentId) {
                const reply_id = reply.reply_id;
                const data = {
                    reply_id: reply_id
                }
                //get reply detail
                const getReplyDetail = await axios.post(API_HOST + "/api/v1/replies/getSingle", data);
                const replyUsersId = getReplyDetail.data.data[0].user_id;
                const UserDetail = await getUserDetail(replyUsersId);
                const name = UserDetail.data.username;
                const targetId = {
                    target_id: reply.reply_id
                }
                //get reaction number
                const getReactionAccount = await axios.post(API_HOST + "/api/v1/reactions/getCountFromTarget", targetId);
                const ReactionAccount = getReactionAccount.data.data.reaction_count;
                const clickedData = {
                    user_id: getUser(),
                    target_id: reply_id
                }
                //get clicked true or false
                const getReactionClicked = await axios.post(API_HOST + "/api/v1/reactions/getUserReactionOfTarget", clickedData);
                const ReactionClicked = getReactionClicked.data.data.reaction;
                const likeClicked = ReactionClicked.like;
                const dislikeClicked = ReactionClicked.dislike;
                const starClicked = ReactionClicked.star;
                print.push(<Comment
                    actions={[
                        <div>
                            <span key="comment-nested-reply-to" onClick={handleReplyOnClick} className={"reply"}
                                  style={{cursor: "pointer"}}>
                                Reply
                                <replyinput style={{display: "none"}}>
                                    <Comment
                                        avatar={
                                            <Avatar alt={name} className={"postAvatar"} size="default" style={{
                                                backgroundColor: "#f56a00",
                                                verticalAlign: 'middle',
                                                fontSize: '17px'
                                            }}>
                                                {JSON.stringify(name).charAt(1).toUpperCase()}
                                            </Avatar>
                                        }
                                        content={
                                            <div className={"reply-input-box"}>
                                                <Form.Item>
                                                    <ReactQuill id="postTextItem" theme="snow"
                                                                placeholder={"Write a post..."}/>
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button htmlType="submit" style={{marginTop: "10px"}}
                                                            parent_post_id={getReplyDetail.data.data[0].parent_post_id}
                                                            parent_reply_id={reply_id}
                                                            onClick={handleReplySubmit}
                                                            type="primary">Reply</Button>
                                                </Form.Item>
                                            </div>
                                        }
                                    >
                                    </Comment>
                                </replyinput>
                            </span>
                            <br/><br/>
                            <Spin spinning={true} style={{"position": "absolute", "background": "rgb(255 255 255 / 83%)", "width": "300px", "display": "none", "padding": "25px 0px", "marginTop": "-23px"}}></Spin>
                            {(likeClicked == "true") ?
                                <span className={"reaction reaction-like reaction-has-like"} style={{cursor: "pointer"}}
                                      reaction={"like"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>
                                :
                                <span className={"reaction reaction-like"} style={{cursor: "pointer"}} reaction={"like"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><LikeFilled/>  Like({ReactionAccount.like})</span>}
                            {(dislikeClicked == "true") ?
                                <span className={"reaction reaction-dislike reaction-has-dislike"}
                                      style={{cursor: "pointer"}} reaction={"dislike"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>
                                :
                                <span className={"reaction reaction-dislike"} style={{cursor: "pointer"}}
                                      reaction={"dislike"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><DislikeFilled/>  Dislike({ReactionAccount.dislike})</span>}
                            {(starClicked == "true") ?
                                <span className={"reaction reaction-star reaction-has-star"} style={{cursor: "pointer"}}
                                      reaction={"star"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>
                                :
                                <span className={"reaction reaction-star"} style={{cursor: "pointer"}} reaction={"star"}
                                      target_id={reply_id} target_type={"reply"}
                                      onClick={handleReactionSubmit}><StarFilled/>  Star({ReactionAccount.star})</span>}

                        </div>
                    ]}
                    author={<a>{name}</a>}
                    avatar={
                        <Avatar alt={name} className={"postAvatar"} size="default" style={{
                            backgroundColor: "#f56a00",
                            verticalAlign: 'middle',
                            fontSize: '17px'
                        }}>
                            {JSON.stringify(name).charAt(1).toUpperCase()}
                        </Avatar>
                    }
                    content={

                        <div dangerouslySetInnerHTML={{__html: reply.reply_text}}></div>

                    }
                >
                    {await printPostReplys(reply_id, handleReplyOnClick, handleReplySubmit, handleReactionSubmit)}
                </Comment>)
            }
        }
    }
    return <div>{print}</div>;
}

//logic is same as upper function
async function printProfileReplys(parentId) {
    const getReplys = await axios.get(API_HOST + "/api/v1/replies/getAll");
    const replys = getReplys.data.data
    let print = [];
    if (replys != null) {
        for (const reply of replys) {
            if (reply.parent_post_id === parentId && reply.parent_reply_id === null || reply.parent_reply_id === parentId) {
                const reply_id = reply.reply_id;
                const data = {
                    reply_id: reply_id
                }
                const getReplyDetail = await axios.post(API_HOST + "/api/v1/replies/getSingle", data);
                const replyUsersId = getReplyDetail.data.data[0].user_id;
                const UserDetail = await getUserDetail(replyUsersId);
                const name = UserDetail.data.username;
                print.push(<Comment
                    author={<a>{name}</a>}
                    avatar={
                        <Avatar alt={name} className={"postAvatar"} size="default" style={{
                            backgroundColor: "#f56a00",
                            verticalAlign: 'middle',
                            fontSize: '17px'
                        }}>
                            {JSON.stringify(name).charAt(1).toUpperCase()}
                        </Avatar>
                    } content={

                    <div dangerouslySetInnerHTML={{__html: reply.reply_text}}></div>

                }
                >
                    {await printProfileReplys(reply_id)}
                </Comment>)
            }
        }
    }
    return <div>{print}</div>;
}

async function editProfilePost(id, newtext) {
    const data = {
        post_id: id,
        new_post_text: newtext
    }
    await axios.post(API_HOST + "/api/v1/posts/edit", data);
}

async function deleteProfilePost(id) {
    const data = {
        post_id: id,
        is_del: "1"
    }
    const response = await axios.post(API_HOST + "/api/v1/posts/delete", data);
    return response.data;
}

async function setFollow(followUserId) {
    const data = {
        user_id: getUser(),
        followed_user_id: followUserId
    }
    const response = await axios.post(API_HOST + "/api/v1/follows/setStatus", data);
    return response.data;
}

async function setReaction(user_id, targetId, reactionString) {
    let reactionInt = "";
    if (reactionString == "like") {
        reactionInt = 10;
    } else if (reactionString == "dislike") {
        reactionInt = 20;
    } else if (reactionString == "star") {
        reactionInt = 30;
    }
    const data = {
        user_id: user_id,
        target_id: targetId,
        reaction: reactionInt
    }
    const response = await axios.post(API_HOST + "/api/v1/reactions/setUserReactionOnTarget", data);
    return response.data;
}

export {
    changeName,
    setReaction,
    setFollow,
    printFollow,
    editProfilePost,
    deleteProfilePost,
    deleteAccount,
    createReply,
    printProfileReplys,
    printPostReplys,
    createPost,
    printPost,
    printFollowingPost,
    changeEmail,
    printProfilePost,
    getPosts,
    getUser,
    getUserDetail,
    setUser,
    verifyUser,
    createUsers,
    removeUser
}