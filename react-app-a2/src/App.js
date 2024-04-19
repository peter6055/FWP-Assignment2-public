import React, {useState,useEffect} from "react";
import 'antd/dist/antd.css';
import './App.css';

import Home from './pages/Home.js';
import Post from './pages/Post.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import Profile from './pages/Profile.js';

import {Avatar, Button, Col, Menu, Row, Spin} from "antd";
import Logo from "./assets/logo.svg";
import {HomeOutlined, LoginOutlined, LogoutOutlined, PicRightOutlined, UserOutlined} from "@ant-design/icons";
import {BrowserRouter, NavLink, Routes, Route} from 'react-router-dom';
import {getUserDetail, removeUser, initUsers, getUserName, setUser,getUser} from "./data/repository";

let activeClassName = "link-active";


function App() {
    // initUsers();
    // const [id, setId] = useState(getUser());
    // const [name, setName] = useState(getUserName(id));
    const [id, setId] = useState(null);
    const [name, setName] = useState(null);
    // Load profiles.
    useEffect(() => {
    async function loadUser() {
        const currentUser = await getUserDetail(getUser())
        setId(currentUser.data.user_id);
        setName(currentUser.data.username);
    }
    loadUser();
    }, []);

    const loginUser = async (id) => {
        setId(id);
        setUser(id);
        const response = await getUserDetail(id);
        setName(response.data.username);
    }

    const logoutUser = () => {
        removeUser();
        setId(null);
        setName(null);
    }

    const editName = (name) => {
        setName(name);
    }

    return (
        <div className="App">
            <div className={"app-loading-container"}>
                <Spin tip="Loading..." className={"app-loading-spinner"}></Spin>
            </div>

            <BrowserRouter>
                <Row className="header">
                    <Col span={6}>
                        <img className="logo" src={Logo} width={150} alt={"Logo"}></img>
                    </Col>

                    <Col span={10} style={{marginTop: "12px"}}>
                        <Menu mode="horizontal">
                            <NavLink to="" className={({isActive}) => isActive && activeClassName}>
                                <Menu.Item icon={<HomeOutlined/>}>Home</Menu.Item>
                            </NavLink>

                            {
                                name ?
                                    <NavLink to="post" className={({isActive}) => isActive && activeClassName}>
                                        <Menu.Item icon={<PicRightOutlined/>}>Post</Menu.Item>
                                    </NavLink>
                                    :
                                    <></>
                            }
                            {
                                name?
                                <></>
                                :
                                <NavLink to="login" className={({ isActive }) => isActive && activeClassName}>
                               <Menu.Item icon={<UserOutlined />}>Account</Menu.Item>
                            </NavLink>
                            }
                            

                            {
                                name ?
                                <NavLink to="profile" className={({isActive}) => isActive && activeClassName}>
                                <Menu.Item icon={<UserOutlined/>}>Profile</Menu.Item>
                            </NavLink>
                                    :
                                    <></>
                            }
                        </Menu>
                    </Col>
                    <Col span={8} className="right-menu">
                        {/* hide this when user is not login
                         then put username and avatar*/}
                        {
                            name ?
                                <>
                                    <Avatar alt={name} className={"postAvatar"} size="default" style={{
                                        backgroundColor: "#f56a00",
                                        verticalAlign: 'middle',
                                        fontSize: '17px'
                                    }}>
                                        { JSON.stringify(name).charAt(1).toUpperCase()}
                                    </Avatar>
                                    <span style={{marginLeft: '10px', color: '#494949'}}>{name}</span></>
                                :
                                <></>
                        }
                        {
                            !name ?
                                <NavLink to="login">
                                    <Button style={{marginLeft: '20px'}} type="primary" shape="" icon={<LoginOutlined/>}
                                            size={'default'}>
                                        Login
                                    </Button>
                                </NavLink>
                                :
                                <></>
                        }

                        {
                            name ?
                                <NavLink to="login" logoutUser={logoutUser}>
                                    <Button onClick={logoutUser} style={{marginLeft: '20px'}} type="primary" shape=""
                                            icon={<LogoutOutlined/>} size={'default'}>
                                        Logout
                                    </Button>
                                </NavLink>
                                :
                                <></>
                        }
                    </Col>
                </Row>


                <Routes>
                    <Route path="/" element={<Home id={id}/>}/>
                    <Route path="post" element={<Post id={id}/>}/>
                    <Route path="login" element={<Login loginUser={loginUser}/>}/>
                    <Route path="signup" element={<Signup loginUser={loginUser}/>}/>
                    <Route path="profile" element={<Profile id={id} logoutUser={logoutUser} editName={editName}/>}/>

                </Routes>

                <Row className="footer">
                    <Col span={24} style={{}}>
                        Loop Agile © 2022 Created by Frocen & Peter
                    </Col>
                </Row>
            </BrowserRouter>

        </div>
    );
}

export default App;
