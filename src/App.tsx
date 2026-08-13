import {Route, Routes} from 'react-router-dom'
import './styles/App.css'

import Home from './pages/home.tsx'
import SignUp from "./pages/SignUp.tsx";


export default function App() {

    return (
        <>
            <Routes>
                {/*<Route path={'/'} element={<Login/>}/>*/}
                <Route path={'/home'} element={<Home/>}/>
                <Route path={'/sign-up'} element={<SignUp/>}/>
            </Routes>
        </>
    )
}
