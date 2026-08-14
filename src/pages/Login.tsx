import {useState} from "react";





function Login()
{
    // This is essentially just the same code as the sign-up page for now.
    // I need to use the user input to check and see if they have an existing account. I should only check for username NOT password for now.
    const [usernameValue, setUsernameValue] = useState("");


    const [passwordValue, setPasswordValue] = useState("");

    const handleLogin = async () =>
    {
        await fetch("/api/login", { // We need to get the backend server running so we can send the user data to the endpoint and handle the user creation logic from there.
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username:usernameValue, password:passwordValue}),
        });
    }

    return (
        <>
            <h1>Login</h1>
            <label>Username:</label>
            <input type="text" value={usernameValue} onChange={(input) => setUsernameValue(input.target.value)}/>
            <label>Password:</label>
            <input type="text" value={passwordValue} onChange={(input) => setPasswordValue(input.target.value)}/>
            <button onClick={() => {
                handleLogin();
            }
            }>Log In
            </button>
        </>);
}
export default Login;