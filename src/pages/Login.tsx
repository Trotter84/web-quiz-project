import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext.tsx";


function Login()
{
    // This is essentially just the same code as the sign-up page for now.
    // I need to use the user input to check and see if they have an existing account. I should only check for username NOT password for now.
    const [usernameValue, setUsernameValue] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const { login } = useUser();




    const handleLogin = async () =>
    {
        setErrorMessage("");
        await fetch("/api/users", {
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username:usernameValue}),
        });
    }

    return (
        <>
            <h1>Login</h1>
            <label>Username:</label>
            <input type="text" value={usernameValue} onChange={(input) => setUsernameValue(input.target.value)}/>
            <button onClick={() => {
                handleLogin();
            }
            }>Log In
            </button>
        </>);
}
export default Login;