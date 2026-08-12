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

    // This is going to be a sign-up header with a username and password input boxes and then Sign up button to store them.
    return (
        <>
            <h3>Sign Up</h3>
            <input type="text" value={storedUsername} onChange={(input) => setUsernameValue(input.target.value)}>Username</input>
            <input type="text" value={storedPassword} onChange={(input) => setPasswordValue(input.target.value)}>Password</input>
            <button onClick={() => {
                handleStoredUsername();
                handleStoredPassword();
            }
            }>Sign Up</button>
        </>
    );
}
export default SignUp;