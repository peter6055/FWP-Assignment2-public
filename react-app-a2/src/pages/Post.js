import React, {useEffect, useState} from 'react';
import {
    Avatar,
    Card,
    Comment,
    Image,
    Row,
    Col,
    Form,
    Input,
    Button,
    Upload,
    Modal,
    message,
    Spin, Alert
} from "antd";
import {PlusOutlined, LoadingOutlined} from '@ant-design/icons';
import $ from 'jquery';
import {
    setFollow,
    createPost,
    printPost,
    createReply,
    getUserDetail,
    printFollowingPost,
    setReaction,
    getUser
} from "../data/repository";
import {upload} from "../data/aws";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const {TextArea} = Input;
const loadingIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;


const Post = (props) => {


    // handling reaction
    const handleReactionSubmit = async (e) => {

        e.target.closest("div").querySelector(".ant-spin-spinning").style.display = "inherit"

        const target_type = e.target.getAttribute("target_type");
        const target_id = e.target.getAttribute("target_id");
        const reaction = e.target.getAttribute("reaction");

        const success = await setReaction(getUser(), target_id, reaction);

        const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
        setPostData(currentPost);

        e.target.closest("div").querySelector(".ant-spin-spinning").style.display = "none"

    }

    //handling follow
    const [filteringTarget, setFilteringTarget] = useState(null);
    const handleFollowSubmit = async (e) => {

        $(e.target).parents(".control-tab").find(".ant-spin-spinning").css("display", "inherit")

        const username = e.target.getAttribute("username");
        const user_id = e.target.getAttribute("user_id");
        const action = e.target.getAttribute("action");

        console.log(e.target.getAttribute("username"));
        console.log(e.target.getAttribute("user_id"));
        console.log(e.target.getAttribute("action"));

        if (user_id === getUser()) {
            message.warning("You cannot follow yourself", 3)
        } else if (action === "follow") {

            await setFollow(user_id);

            $(".app-loading-container").css("display", "inline");
            const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
            await setPostData(currentPost);
            $(".app-loading-container").css("display", "none");

            message.success(<div>You had follow {username}, would you like to see {username}'s posts? <span
                className={"clickable"} onClick={await handleFollowPostFilter}
                user_id={user_id} user_name={username}>Yes, show me the posts!</span></div>, 3)


        } else {
            $(".app-loading-container").css("display", "inline");
            await setFollow(user_id);
            const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
            await setPostData(currentPost);
            setFilteringTarget(null);
            $(".app-loading-container").css("display", "none");
            message.success("You had successfully unfollow " + username + "!")
        }

        $(e.target).parents(".control-tab").find(".ant-spin-spinning").css("display", "none")
    }

    const handleFollowPostFilter = async (e) => {

        $(".app-loading-container").css("display", "inline");

        const user_id = e.target.getAttribute("user_id");
        const user_name = e.target.getAttribute("user_name");

        setFilteringTarget(
            <Alert
                message={"Now filtering " + user_name + "'s post"}
                description="Post made by other user are remove in this view. Re-click this page to undo this action."
                type="info"
                style={{marginBottom: "10px"}}
                showIcon
            />);

        const currentPost = await printFollowingPost(user_id, handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
        setPostData(currentPost);


        // back to top
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera

        $(".app-loading-container").css("display", "none");

    }


    const handleReplyOnClick = (e) => {
        var currentReplyInputDisplay = $(e.target).children().css("display")

        if (currentReplyInputDisplay == "none") {
            $(e.target).children().css({display: "inline"});

        } else if (currentReplyInputDisplay == "inline") {
            $(e.target).children().css({display: "none"});
        }
    };

    const handleReplySubmit = async (e) => {

        $(".app-loading-container").css("display", "inline");


        // this is text of post
        const text = $(e.target).closest('.reply-input-box').find('.ql-editor')[0].innerHTML;
        const text_length = $(e.target).closest('.reply-input-box').find('.ql-editor')[0].innerText.length;


        // this a new way to detect word limit due to formatted text implementation
        if (text_length > 600 || (text_length < 2 && text === "<p><br></p>")) {
            message.error({
                content: 'Reply message can not be empty or exceed 600 characters',
            });
            return
        }

        const parent_post_id = $(e.target).closest(".ant-form-item").find('button').attr("parent_post_id");
        const parent_reply_id = $(e.target).closest(".ant-form-item").find('button').attr("parent_reply_id");
        $(e.target).closest('.ant-comment-content-detail').find('textarea').val('').change();
        createReply(props.id, parent_post_id, parent_reply_id, text);
        // successful msg
        message.success({
            content: 'Reply posted',
        });

        // after successful reply
        // hide reply input
        $(e.target).closest('replyinput').css({display: "none"});

        const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
        await setPostData(currentPost);

        $(".app-loading-container").css("display", "none");

    }


    const [Name, setName] = useState(null);
    const [postsData, setPostData] = useState(null);

    // ============================================================== Make Post ===============================
    const [fileList, setFileList] = useState([]);
    useEffect(() => {
        async function loadPost() {
            $(".app-loading-container").css("display", "inline");

            const currentUser = await getUserDetail(props.id);
            const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit)
            await setName(currentUser.data.username);
            await setPostData(currentPost);

            $(".app-loading-container").css("display", "none");

        }

        loadPost();


    }, []);


    const MakePostElement = () => (
        <Card style={{width: "100%"}}>
            <Comment
                avatar={
                    <Avatar alt={Name} className={"postAvatar"} size="default" style={{
                        backgroundColor: "#f56a00",
                        verticalAlign: 'middle',
                        fontSize: '17px'
                    }}>
                        {JSON.stringify(Name).charAt(1).toUpperCase()}
                    </Avatar>
                }
                content={
                    <div>
                        <Form.Item>
                            <ReactQuill id="postTextItem" theme="snow" placeholder={"Write a post..."}/>

                        </Form.Item>
                        <Form.Item>
                            <Upload
                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                accept="image/*"
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handleFilePreview}
                                onChange={handleFileUpload}
                                onRemove={handleFileRemove}
                            >
                                {fileList.length >= 8 ? null :
                                    <div>
                                        <PlusOutlined/>
                                        <div style={{marginTop: 8,}}>Upload</div>
                                    </div>
                                }
                            </Upload>
                            <Spin indicator={loadingIcon} style={{display: "none"}} id={"upload-loading-spinner"}
                                  tip="Uploading..."/>
                            <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
                                <img
                                    alt="example"
                                    style={{
                                        width: '100%',
                                    }}
                                    src={previewImage}
                                />
                            </Modal>
                            <TextArea type={"hidden"} style={{display: "none"}} id="postImageItem" rows={4}/>
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" onClick={handleSubmitPost} type="primary">Make a Post</Button>
                        </Form.Item>
                    </div>
                }
            >
            </Comment>
        </Card>
    );


    // upload file
    const [forceRendering, setForceStatus] = useState(0);

    let url;
    const handleFileUpload = (e) => {
        console.log(e);
        // display loading state, no using hook cuz re-rendering cause upload issue
        $("#upload-loading-spinner").css("display", "flex");

        let status = e.file.status;
        let event = e.event;
        let uid = e.file.uid;
        let name = e.file.name;
        let type = e.file.type;


        let fileExtension = type.replace(/(.*)\//g, '');
        let fileUploadName = uid + '.' + fileExtension;

        let reader = new FileReader();
        reader.readAsDataURL(e.file.originFileObj);

        // because render.onLoad will fire onChange three times
        // this is to push the images only in the first time
        if (status === "uploading" && e.event === undefined) {
            reader.onload = function (e) {

                var result = upload(fileUploadName, reader.result, type);

                if (result !== "") {

                    url = 'https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/' + fileUploadName

                    setTimeout(function () {
                        fileList.push({"uid": uid, "name": name, "status": "done", "url": url});
                    }, 500);


                } else {
                    alert("AWS upload promise issue");
                }

            }

            // error means end, cuz we are not handling upload official
        } else if (status === "error") {
            // when end, hide loading state
            $("#upload-loading-spinner").css("display", "none");

            // re-render after finish to flush the image display from s3
            // avoid the list push faster than s3 upload finalise
            setTimeout(function () {
                setForceStatus(forceRendering + 1);
            }, 1500);

        }
    }

    // for preview modal (source: https://ant.design/components/upload/#onChange)
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('')
    const handleFilePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = file;
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };
    const handleCancel = () => setPreviewVisible(false);


    // remove file
    const [forceRefresh, setForceRefresh] = useState(0);
    const handleFileRemove = (e) => {
        let uid = e.uid;
        for (var count = 0; count < fileList.length; count++) {

            if (fileList[count].uid === uid) {
                fileList.splice(count, 1);
            }
        }

        //force refresh to refresh the file list
        setForceRefresh(forceRefresh + 1);
    }


    // onclick make a post
    const handleSubmitPost = async () => {
        $(".app-loading-container").css("display", "inline");


        // this is text of post
        const text = document.getElementById("postTextItem").getElementsByTagName('div')[1].getElementsByClassName("ql-editor")[0].innerHTML;
        const text_length = document.getElementById("postTextItem").getElementsByTagName('div')[1].getElementsByClassName("ql-editor")[0].innerText.length;

        console.log(text_length);

        // frocen: this a new way to detect word limit due to formatted text implementation
        if (text_length > 600 || (text_length < 2 && text === "<p><br></p>")) {
            message.error({
                content: 'Post message can not be empty or exceed 600 characters',
            });
            return
        }
        await createPost(props.id, text, fileList);
        // successful msg
        message.success({
            content: 'Post successful',
        });

        // clear file list
        setFileList([]);
        const currentPost = await printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit);
        await setPostData(currentPost);

        $(".app-loading-container").css("display", "none");

    };
    // ============================================================== Make Post ===============================

    return (
        <Row className={"postPage safeArea"} style={{display: "flex", justifyContent: "center"}}>
            <Col span={24} style={{maxWidth: "1000px"}}>
                <div className={"postContainer"}>
                    {filteringTarget}
                    <MakePostElement></MakePostElement>
                    {postsData}
                </div>
            </Col>
        </Row>
    );

}

export default Post;