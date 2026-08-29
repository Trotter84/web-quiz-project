import {Route, Routes} from 'react-router-dom'
import {UserProvider} from "./context/UserContext.tsx";
import './styles/app.css'

import Home from './pages/Home.tsx'
import SignUp from "./pages/SignUp.tsx";
import Login from "./pages/Login.tsx";
import QuizScreen from "./pages/QuizScreen.tsx";
import {SocketProvider} from "./context/SocketContext.tsx";
import Multiplayer from "./pages/Multiplayer.tsx";
import MultiplayerGame from "./pages/MultiplayerGame.tsx";
import Lobby from "./pages/Lobby.tsx";
import ModeSelection from "./pages/ModeSelection.tsx";
import GameEnd from "./pages/GameEnd.tsx";


export default function App() {

    return (
        <UserProvider>
            <SocketProvider>
                <Routes>
                    {/*<Route path={'/'} element={<Login/>}/>*/}
                    <Route path={'/home'} element={<Home/>}/>
                    <Route path={'/sign-up'} element={<SignUp/>}/>
                    <Route path={'/login'} element={<Login/>}/>
                    <Route path={'/quiz/:category'} element={<QuizScreen/>}/>
                    <Route path={'/multiplayer'} element={<Multiplayer/>}/>
                    <Route path={'/multiplayer/lobby/:code'} element={<Lobby/>}/>
                    <Route path={'/multiplayer/game/:code'} element={<MultiplayerGame/>}/>
                    <Route path={'/multiplayer/game-end/:code'} element={<GameEnd/>}/>
                    <Route path={'/'} element={<ModeSelection/>}/>
                </Routes>
            </SocketProvider>
        </UserProvider>
    );
}
