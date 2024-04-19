import React, {useState, useEffect} from "react";
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
    AutoComplete
} from "antd";
import {QuestionCircleOutlined, MinusCircleFilled} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';

import {
    changeEmail,
    changeName,
    editProfilePost,
    deleteProfilePost,
    setFollow,
    deleteAccount,
    getUserDetail,
    printFollow,
    printProfilePost
} from "../data/repository";
import $ from "jquery";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const {Text, Paragraph} = Typography;

const Profile = (props) => {
    const navigate = useNavigate();

    const [Email, setEmail] = useState(null);
    const [Name, setName] = useState(null);
    const [date, setDate] = useState(null);
    const [postsProfileData, setProfilePostData] = useState(null);
    const [followData, setFollowData] = useState(null);

    useEffect(() => {
        async function loadUser() {
            const currentUser = await getUserDetail(props.id);
            const currentProfilePost = await printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost);
            const currentFollow = await printFollow(handleFollowSubmit);
            setEmail(currentUser.data.email);
            setName(currentUser.data.username);
            setDate(currentUser.data.join_date);
            setProfilePostData(currentProfilePost);
            setFollowData(currentFollow);
        }

        loadUser();
    }, []);
    //delete account
    const confirmSelected = async () => {
        deleteAccount(props.id);
        props.logoutUser();
        navigate("/");
        message.success({
            content: 'Account deleted! You are now logout.',
        });
    };

    //handling follow
    const handleFollowSubmit = async (e) => {
        const username = e.target.closest("button").getAttribute("username");
        const user_id = e.target.closest("button").getAttribute("user_id");
        console.log(username);
        console.log(user_id);

        await setFollow(user_id);
        const currentFollow = await printFollow(handleFollowSubmit);
        setFollowData(currentFollow);
        message.success("You had successfully unfollow " + username + "!")
    }
    const handleNameChange = (event) => {
        if (changeName(props.id, event)) {
            setName(event);
            // refresh page to refresh props.id
            //window.location.reload(false);
            props.editName(event);
        }
    }
    const handleEmailChange = (event) => {
        if (changeEmail(props.id, event)) {
            setEmail(event);
        }
    }


    const editPostOnClick = (e) => {
        // this is the post content text already display on the entry
        var currentPostText = $(e.target).closest('.ant-comment-content').find('.postText > p').text();

        // hide read only and add a textarea
        $(e.target).closest('.ant-comment-content').find('.postText > p').css({display: "none"})


        $(e.target).closest('.ant-comment-content').find('.postText > .quill ').css({display: "inline"});


        // add a save btn after the content text
        $(e.target).closest('.ant-comment-content').find('.postText > button').css({display: "inline"});

        // hide edit post btn
        $(e.target).css({display: "none"});

    };

    async function handleEditPost(e) {
        // get post id
        const id = $(e.target).closest(".postText > button").attr("postId");

        // this is text of post
        const newText = $(e.target).closest('.ant-comment-content').find('.postText > .quill ').find('.ql-editor')[0].innerHTML;
        const newText_length = $(e.target).closest('.ant-comment-content').find('.postText > .quill ').find('.ql-editor')[0].innerText.length;


        // this a new way to detect word limit due to formatted text implementation
        if (newText_length > 600 || !newText) {
            message.error({
                content: 'Post message can not be empty or exceed 600 characters',
            });
            return
        }
        await editProfilePost(id,newText);
        const currentProfilePost = await printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost);
        setProfilePostData(currentProfilePost);   


        // recover to non-editable mode
        // remove text area

        $(e.target).closest('.ant-comment-content').find('.postText > .quill ').css({display: "none"});

        // show read only text
        $(e.target).closest('.ant-comment-content').find('.postText > p').css({display: "inline"})

        // hide save btn
        $(e.target).closest('.ant-comment-content').find('.postText > button').css({display: "none"});

        // show edit post btn
        $(e.target).closest('.ant-comment-content').find('.ant-comment-actions > li:first > span').css({display: "inline"});

        // successful msg
        message.success({
            content: "Edit successful",
        });
    }

    async function deletePost(e) {
        // get post id
        const id = $(e.target).closest(".ant-popover-inner-content").find('input').val();
        const response = await deleteProfilePost(id);
        if (response.success) {
            message.success({
                content: 'Post message deleted!',
            });
            const currentProfilePost = await printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost);
            setProfilePostData(currentProfilePost);            
            return true
        } else {
            message.error({
                content: response.data.message,
            });
        }
    }

    return (
        <Row className={"profilePage safeArea"} style={{display: "flex", justifyContent: "center"}}>
            <Col span={3} style={{display: "flex", justifyContent: "flex-end"}}>
                <div className={"profileContainer"} style={{maxWidth: "370px"}}>
                    <Card style={{width: "100%"}}>
                        <Avatar size={100} alt="Han Solo"
                                className={"profilePageAvatar"}
                                style={{backgroundColor: "#f56a00", verticalAlign: 'middle', fontSize: '70px'}}>
                            {JSON.stringify(Name).charAt(1).toUpperCase()}
                        </Avatar>

                        <Typography.Title
                            editable={{
                                onChange: handleNameChange,
                            }}
                            level={3}
                            style={{
                                marginTop: "20px",
                                marginLeft: "2px",
                                marginBottom: "5px"
                            }}
                        >
                            {Name}
                        </Typography.Title>

                        <Paragraph
                            editable={{
                                onChange: handleEmailChange,
                                tooltip: 'click to edit text',
                            }}
                            style={{
                                marginLeft: "2px",
                                marginBottom: "30px"
                            }}
                        >
                            {Email}
                        </Paragraph>

                        {/*MFA not in use*/}
                        {/*<Button type="primary" onClick={showModal}>Setup MFA</Button>*/}
                        {/*<MFAModal></MFAModal>*/}
                        {/*<br/>*/}
                        {/*<br/>*/}
                        <Text type="secondary">{date}</Text>
                        <br/>
                        <br/>

                        <Divider orientation="center" plain>Danger Zone</Divider>

                        <Popconfirm
                            title={"After you delete your account, you are not able to login as a user. All of you post will be delete as well."}
                            icon={
                                <QuestionCircleOutlined
                                    style={{
                                        color: 'red',
                                    }}
                                />
                            }
                            onConfirm={confirmSelected}
                            placement="bottom"
                            okText="Delete Forever!"
                            cancelText="No"
                        >
                            <a><Button danger> Delete my account</Button></a>
                        </Popconfirm>
                    </Card>
                </div>
            </Col>
            <Col span={12} style={{maxWidth: "855px"}}>
                <div className={"postContainer"}>
                    {postsProfileData}
                </div>
            </Col>
            <Col span={4} style={{maxWidth: "300px"}}>
                <div className={"postContainer"}>
                    <Card
                        title="Followed"
                        style={{
                            minWidth: 270,
                            maxWidth: 300,
                            width: "60%"
                        }}
                    >
                        {followData}

                    </Card>
                </div>
            </Col>
        </Row>
    );

}


export default Profile;