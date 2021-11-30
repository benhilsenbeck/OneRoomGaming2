import { useEffect } from "react";
import "../static/css/HomePage.scss"
import logo from "../static/Images/logoTest.png";
import gsap from 'gsap';
import BackgroundVideo from "../static/videos/video.mp4";
import BackgroundVideo2560 from "../static/videos/video2560.mp4";
import {Link} from "react-router-dom";
import CheckToken from './JWTCheck'
import { useDispatch } from 'react-redux'
import { login } from '../actions';


function HomePage () {
    const dispatch = useDispatch();
    async function checkUserToken() {
        var tokenCheck = await CheckToken()
        if (tokenCheck === 'resetAccessToken') {
            dispatch(login())
        } else if (tokenCheck === 'Valid') {
            dispatch(login())
        }
      }

    useEffect(() => {
        checkUserToken()
        gsap.fromTo(".title1", {opacity: 0, duration: 1}, {opacity: 1, duration: 2});
        gsap.to(".title1", {opacity: 0, duration: 1, delay: 2});
        gsap.fromTo(".title2", {opacity: 0, duration: 1, delay: 1}, {opacity: 1, duration: 2, delay: 4});
        gsap.to(".title2", {opacity: 0, duration: 1, delay: 6});
        gsap.to(".introduction", {opacity: 0, duration: 2, delay: 7})
        gsap.fromTo(".videoBackground", {opacity:0}, {opacity: 1, duration: 1.5, delay: 8});
        gsap.fromTo(".logo", {opacity: 0}, {opacity: 1, duration: 1, delay: 9.5});
        gsap.fromTo(".getStarted", {opacity: 0}, {opacity: 1, duration: 1, delay: 9.5});
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    return (
            <section className="mainSection">
                <div className="videoBackground">
                    <video id="videoBG" autoPlay muted loop>
                        <source src={BackgroundVideo} type="video/mp4" className="video3160"/>
                    </video>
                    <video id="videoBG2560" autoPlay muted loop>
                        <source src={BackgroundVideo2560} type ="video/mp4" className="video2560"/>
                    </video>
                </div>
                <div className="introduction">
                    <div className="titles">
                        <p className="title1">One Room Gaming</p>
                        <p className="title2">Join Now!</p>
                    </div>
                </div>
                <div className="content">
                    <img src={logo} alt="logo" className="logo" />
                    <Link to ="/createAccount" className="link" style={{ textDecoration: 'none' }}><button className="btn btn-outline-light getStarted">Get Started</button></Link>
                </div>

            </section>
        );
}

export default HomePage;