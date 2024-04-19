import React from 'react';
import {NavLink} from "react-router-dom";
import {Col, Row, Button} from 'antd';

import chatLogo from '../assets/speak.png'

const Home = () => {
    return (<Row className={"safeArea"} style={{height: '100vh'}}>
            <Col span={12} className={"Landing-background"}>
                <img src={chatLogo} width={400} alt={"logo"}></img>
            </Col>
            <Col span={12} className={"Landing-background Landing-text-padding"}>

                <h1><strong>LOOP AGILE</strong></h1>
                <h2>We specialises in designing, delivering and managing innovative data, analytics, customer engagement
                    and cloud solutions that help sustain competitive advantage. We will help the employees to make a
                    post, reply to other posts and maintain their profile details.</h2>

                <NavLink to="login">
                    <Button type="primary" size={"default"} value={"try-it"}>Try it</Button>
                </NavLink>
            </Col>
        </Row>
    );
}


export default Home;