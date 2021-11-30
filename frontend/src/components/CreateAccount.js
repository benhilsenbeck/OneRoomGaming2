import React, {useState} from 'react'
import "../static/css/CreateAccount.scss"
import { Link } from "react-router-dom";
import axios from 'axios'
import { useHistory } from "react-router";
const config = require('./constants').config()



function CreateAccount () {
    const history = useHistory();
    const [fName, setFName] = useState("");
    const [lName, setLName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [formErrors, setFormErrors] = useState ( {
        emptyField: true,
        invalidEmail: true,
        passwordError: true,
    });

    function checkIfEmailInString(text) {
        var re = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
        return re.test(text);
    }

    const handleSubmit = (event) => {
    event.preventDefault();
    const user = {
        fName: fName,
        lName: lName,
        username: username,
        email: email,
        password: password,
        passwordConfirm: passwordConfirm
    }
    if (String(user.fName) === "" || String(user.lName) === "" || String(user.username) === "" || String(user.email) === "" || String(user.password) === "" || String(user.passwordConfirm) === "" ) {
        setFormErrors({
            emptyField: false,
            invalidEmail: true,
            passwordError: true,
        })
    } else if (checkIfEmailInString(String(user.email)) === false) {
        setFormErrors({
            emptyField: true,
            invalidEmail: false,
            passwordError: true,
        })
    } else if (String(user.password) !== String(user.passwordConfirm)) {
        setFormErrors({
            emptyField: true,
            invalidEmail: true,
            passwordError: false,
        })
    } else {
        axios.post(config.API_URL + 'userCreatAccount', {
            fName: user.fName,
            lName: user.lName,
            username: user.username,
            email: user.email,
            password: user.password,
        },).then(res => {
            history.push("/login")
        }).catch(err => {
        })
    }
}

            return (
                <div className ="loginBackground">
                <div className="wrapperCreateAccount">
                    <div className = "createAccountTitle">
                        <p>Create An Account</p>
                    </div>
                    <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="firstName">
                                <input type="text" className="form-control" placeholder="First Name" name="fName" value={fName} onChange={e => setFName(e.target.value)}/>
                            </div>
                            <div className="lastName">
                                <input type="text" className="form-control" placeholder="Last Name" name="lName" value={lName} onChange={e => setLName(e.target.value)} />
                            </div>
                            <div className="username">
                                <input type="text" className="form-control" placeholder="Username" name="username" value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                            <div className="signUpEmailAddress">
                                <input type="text" className="form-control" placeholder="Email Address" name="email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div className="signUpPassword">
                                <input type="password" className="form-control" placeholder="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div className="signUpPasswordConfirm">
                                <input type="password" className="form-control" placeholder="Confirm Password" name="passwordConfirm" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} />
                            </div>
                            <div className="createAccountErrors">
                                {formErrors.emptyField ? <p></p> : <p>Please fill in all fields</p>}
                                {formErrors.invalidEmail ? <p></p> : <p>Please enter a valid email</p>}
                                {formErrors.passwordError ? <p></p> : <p>Passwords do not match</p>}
                            </div>
                            <div className="createAccountSubmit">
                                <button type="submit" className="btn btn-outline-light">Submit</button>
                            </div>
                        </div>
                    </form>
                    </div>
                    
                    <div className="loginLink">
                    <Link to="/login" className="link" style={{ textDecoration: 'none' }}><p>Already Have an Account? Login Now!</p></Link>
                    </div>
                <div className="createAccountForm">
                </div>
                </div>
                </div>)

}

export default CreateAccount