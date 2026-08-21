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
        const response = await fetch("/api/users/check?name=" + usernameValue);
        const nameJson = await response.json();

        if (nameJson.exists)
        {
            login(usernameValue);
            console.log("Logged into " + usernameValue);
            navigate("/home");
        }
        else
        {
            setErrorMessage("Username does not exists. Please create an account.");
        }
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
            <p style={{color: "red"}}>{errorMessage}</p>
        </>);
}
export default Login;