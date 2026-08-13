import {useState} from "react";





function Login()
{
    // This is essentially just the same code as the sign-up page for now.
    // I need to use the user input to check and see if they have an existing account. I should only check for username NOT password for now.
    const [usernameValue, setUsernameValue] = useState("");
    const [storedUsername, setStoredUsername] = useState("");

    const [passwordValue, setPasswordValue] = useState("");
    const [storedPassword, setStoredPassword] = useState("");

    const handleStoredUsername = () =>
    {
        setStoredUsername(usernameValue);
        setUsernameValue(""); // This should clear the username text box
    };

    const handleStoredPassword = () =>
    {
        setStoredPassword(passwordValue);
        setPasswordValue(""); // This should clear the password text box
    }

    // This function cannot work without a given JSON file.
    function checkIfAccountExists()
    {
        interface User
        {
            name: string;
        }
        const exampleUser = {name: "Parker"};

        const users: User[] = [exampleUser];

        for (const user of users)
        {
            const {name} = user;
            if (name == storedUsername)
            {
                console.log("User found!");
            }
        }
    }

    if (storedUsername === "" && storedPassword === ""){}
    return (
        <>
            <h1>Login</h1>
            <input type="text" value={usernameValue} onChange={(input) => setUsernameValue(input.target.value)}/>
            <input type="text" value={passwordValue} onChange={(input) => setPasswordValue(input.target.value)}/>
            <button onClick={() => {
                handleStoredUsername();
                handleStoredPassword();
                checkIfAccountExists();
            }
            }>Sign Up
            </button>
        </>);
}
export default Login;