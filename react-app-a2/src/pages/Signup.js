import {message, Col, Row, Input, Space, Button, Alert} from 'antd';
import {UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined} from '@ant-design/icons';

import AccountPageBg from "../assets/account-page-bg.svg";
import Logo from '../assets/logo.svg'

import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {Link} from "react-router-dom";
import {createUsers} from "../data/repository";



const Signup = (props) => {
    const navigate = useNavigate();
    const [fields, setFields] = useState({username: "", password: "", email: ""});
    const [errorMessage, setErrorMessage] = useState(null);
    //const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!fields.username) {
            setErrorMessage("User name can not be empty");
        }else if (!fields.email) {
            setErrorMessage("Email address can not be empty");
        } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
            setErrorMessage("Email address should be valid");
        } else if (fields.password.length < 8) {
            setErrorMessage("Password length can not less than 8");
        } else if (!/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/.test(fields.password) || !/[A-Z]/.test(fields.password) || !/[0-9]/.test(fields.password) || !/[a-z]/.test(fields.password)) {
            setErrorMessage("Password should be strong");
        } else {

            const id= await createUsers(fields.username, fields.password, fields.email);
            console.log(id);

            if(id.code !== 200){
                setErrorMessage(id.message);

            } else {
                props.loginUser(id.data);
                navigate("/Profile");
                message.success({
                    content: 'Welcome ' + fields.username + "!",
                });
            }
        }
    }
    // Generic change handler.
    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        // Copy fields.
        const temp = {username: fields.username, password: fields.password, email: fields.email};
        // Update field and state.
        temp[name] = value;
        setFields(temp);
    }
    return (
        <Row style={{height: 'calc(100vh - 50px)'}}>
            <Col className={"login-page login-page-left"} span={12} style={{}}>
                <img src={Logo} width={300} style={{paddingBottom: "20px"}} alt="Logo"></img>
                <img src={AccountPageBg} width={400} alt="AccountPageBg"></img>
            </Col>
            <Col className={"login-page login-page-right"} span={12} style={{}}>
                <form id={"login-form"}>
                    <h1><strong>Sign up to LAN</strong></h1>

                    <p>Username</p>
                    <Input size="large" name="username" onChange={handleInputChange} placeholder="Input username"
                           prefix={<UserOutlined/>}/>
                    <br/>
                    <br/>

                    <p>Email</p>
                    <Input size="large" placeholder="Input email" name="email" onChange={handleInputChange}
                           prefix={<MailOutlined/>}/>
                    <br/>
                    <br/>

                    <p>Password</p>
                    <Space direction="vertical" style={{width: "100%"}}>
                        <Input.Password
                            name="password"
                            onChange={handleInputChange}
                            size="large"
                            placeholder="Input password"
                            iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                            prefix={<LockOutlined/>}
                        />
                    </Space>
                    <br/>
                    <br/>
                    {errorMessage !== null && <Alert message={errorMessage} type="error" showIcon />}
                    <br/>
                    <Button type="primary" size={"default"} onClick={handleSubmit}>Sign up</Button>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;or
                    <Link className={"link"} to="/login" state={"From Contact Page"}>&nbsp;Login</Link>
                </span>
                </form>
            </Col>
        </Row>);
}


export default Signup;