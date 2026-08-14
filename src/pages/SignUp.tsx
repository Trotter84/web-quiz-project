import {useState} from "react";
//import * as fs from 'fs';


// I will likely use this code structure to make the login page as well. I might eventually make a more general method to handle input boxes overall for login, sign up, answer quiz questions etc.
function SignUp()
{
    const [usernameValue, setUsernameValue] = useState("");


    const [passwordValue, setPasswordValue] = useState("");




    const handleSignUp = async () =>
    {
        await fetch("/api/signup", { // We need to get the backend server running so we can send the user data to the endpoint and handle the user creation logic from there.
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username:usernameValue, password:passwordValue}),
        });
    }




    // This is going to be a sign-up header with a username and password input boxes and then Sign up button to store them.
    // I need to center the elements and make the width of the input boxes smaller
    return (
        <>
            <h1>Sign Up</h1>
            <label>Username:</label>
            <input type="text" value={usernameValue} onChange={(input) => setUsernameValue(input.target.value) }/>
            <label>Password:</label>
            <input type="password" value={passwordValue} onChange={(input) => setPasswordValue(input.target.value)}/>
            <button onClick={() => {
                handleSignUp();
            }
            }>Sign Up</button>
        </>);
}
export default SignUp;