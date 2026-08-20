import {Route, Routes} from 'react-router-dom'
import { UserProvider } from "./context/UserContext.tsx";
import './styles/App.css'

import Home from './pages/Home.tsx'
import SignUp from "./pages/SignUp.tsx";
import Login from "./pages/Login.tsx";
import QuizScreen from "./pages/QuizScreen.tsx";

export default function App() {

    return (
        <UserProvider>
            <Routes>
                {/*<Route path={'/'} element={<Login/>}/>*/}
                <Route path={'/home'} element={<Home/>}/>
                <Route path={'/sign-up'} element={<SignUp/>}/>
                <Route path={'/login'} element={<Login/>}/>
                <Route path={'/quiz/:category'} element={<QuizScreen/>}/>

            </Routes>
        </UserProvider>
    );
}
