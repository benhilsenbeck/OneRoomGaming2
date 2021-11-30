import React, { useState} from 'react'
import "../static/css/login.scss";
import { Link } from "react-router-dom";
import {login} from '../actions';
import { useDispatch } from 'react-redux'
import { useHistory } from "react-router";
import axios from 'axios'
const config = require('./constants').config()

function Login () {
    const [validLogin, setValidLogin] = useState(true)
    const [validEmail, setValidEmail] = useState(true)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const history = useHistory();
    
    
    function checkIfEmailInString(text) {
        var re = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return re.test(text);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const checkEmail = checkIfEmailInString(email);
        if (checkEmail === false) {
            setValidEmail(false)
            setValidLogin(true)
        } else {
            axios.post(config.API_URL + 'token/obtain', {
            email: email,
            password: password,
        }, )
        .then(response => {
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            dispatch(login())
            history.push({
                pathname: "/dashboard"});
        }).catch((err) => {
            setValidLogin(false)
            setValidEmail(true)
        })
        }
    }
    
    return (
            <div className ="loginBackground">
            <div className="wrapper">
            <div className = "loginTitle">
                 <p>Login</p>
            </div>
            <form onSubmit={handleSubmit} >
                <div className="form-row">
                    <div className="emailAddress">
                        <input type="text" className="form-control" name="email" value={email} placeholder="Email Address" onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className="password">
                        <input type="password" className="form-control" name="password" value={password} placeholder="password" onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <div className="errorMessage">
                        {validLogin ? <p></p> : <p>The email or password is inccorect</p>}
                        {validEmail ? <p></p> : <p>Please Enter a Valid Email</p>}
                    </div>
                    <div className="loginSubmit">
                        <button type="submit" className="btn btn-outline-light">Login</button>
                    </div>
                    </div>
                </form>
                
                <div className="createAccountLink">
                <Link to="/createAccount" className="link" style={{ textDecoration: 'none' }}><p>Don't have an account? Sign Up Now!</p></Link>
                </div>
        
        
        <div className="loginForm">
        </div>
        </div>
        </div>
        )
}

export default Login
