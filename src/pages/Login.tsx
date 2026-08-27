import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useUser} from "../context/UserContext.tsx";
import "../styles/login.css";

function Login() {
    const [usernameValue, setUsernameValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    const {login} = useUser();

    const handleLogin = async () => {
        setErrorMessage("");
        const response = await fetch("/api/users/check?name=" + usernameValue);
        const nameJson = await response.json();

        if (nameJson.exists) {
            login(usernameValue);
            console.log("Logged into " + usernameValue);
            navigate("/");
        } else {
            setErrorMessage("Username does not exists. Please create an account.");
        }
    }

    return (
        <div className="login-page">
            <h1>Login</h1>
            <label className="login-label">Username:</label>
            <input
                className="login-input"
                type="text"
                value={usernameValue}
                onChange={(input) => setUsernameValue(input.target.value)}
            />
            <button className="login-button" onClick={() => {
                handleLogin();
            }}>
                Log In
            </button>
            <p className="login-error" style={{color: "red"}}>{errorMessage}</p>
        </div>
    );
}

export default Login;