import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/signUp.css";

//import * as fs from 'fs';


// I will likely use this code structure to make the login page as well. I might eventually make a more general method to handle input boxes overall for login, sign up, answer quiz questions etc.
function SignUp() {
    const [usernameValue, setUsernameValue] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const handleSignUp = async () => {

        const response = await fetch("/api/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username: usernameValue}),
        });
        if (response.status === 409) {
            console.log("Username already taken");
            setErrorMessage("Username already taken");
        } else if (response.ok) {
            navigate("/login");
            setErrorMessage("");
        }
    }


    // This is going to be a sign-up header with a username and password input boxes and then Sign up button to store them.
    // I need to center the elements and make the width of the input boxes smaller
    return (
        <div className="signup-page">
            <h1>Sign Up</h1>
            <label className="signup-label">Username:</label>
            <input
                className="signup-input"
                type="text"
                value={usernameValue}
                onChange={(input) => setUsernameValue(input.target.value)}
            />
            <button className="signup-button" onClick={() => {
                handleSignUp();
            }
            }>Sign Up
            </button>
            <p className="signup-error">{errorMessage}</p>
        </div>);
}

export default SignUp;