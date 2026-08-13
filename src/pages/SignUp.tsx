import {useState} from "react";
//import * as fs from 'fs';


//Save user data to a json file and send it to the mongodb




// I will likely use this code structure to make the login page as well. I might eventually make a more general method to handle input boxes overall for login, sign up, answer quiz questions etc.
function SignUp()
{
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

    // Stores user data to a JSON file which will later be stored into mongodb in a different function
    // function saveDataJson()
    // {
    //     const userName = storedUsername;
    //     const password = storedPassword;
    //
    // }


    // I need to have the user schema to know how to store the username and password in a proper JSON format

    if (storedUsername === "" && storedPassword === ""){} //Useless if statement to use the stored variables to not make the compiler mad for now. These will be used to store the users info into a JSON format

    // This is going to be a sign-up header with a username and password input boxes and then Sign up button to store them.
    return ( // I need to center the elements and make the width of the input boxes smaller
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