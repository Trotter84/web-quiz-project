import {useState} from "react";

function SignUp()
{
    const [usernameValue, setUsernameValue] = useState("");
    const [storedUsername, setStoredUsername] = useState("");

    const [passwordValue, setPasswordValue] = useState("");
    const [storedPassword, setStoredPassword] = useState("");

    const handleStoredUsername = () =>
    {
        setStoredUsername(usernameValue);
        setUsernameValue(""); // This should clear the text box
    };

    const handleStoredPassword = () =>
    {
        setStoredPassword(passwordValue);
        setUsernameValue(""); // This should clear the text box
    }
    if (storedUsername === "" && storedPassword === ""){}
    // This is going to be a sign-up header with a username and password input boxes and then Sign up button to store them.
    return (
        <>
            <h1>Sign Up</h1>
            <input type="text" value={usernameValue} onChange={(input) => setUsernameValue(input.target.value)}/>
            <input type="text" value={passwordValue} onChange={(input) => setPasswordValue(input.target.value)}/>
            <button onClick={() => {
                handleStoredUsername();
                handleStoredPassword();
            }
            }>Sign Up</button>
        </>);
}
export default SignUp;