import {Route, Routes} from 'react-router-dom'
import './styles/App.css'

import Home from './pages/Home.tsx'
import SignUp from "./pages/SignUp.tsx";
import Login from "./pages/Login.tsx";

export default function App() {

    return (
        <>
            <Routes>
                <Route path={'/'} element={<Home/>}/>
                <Route path={'/sign-up'} element={<SignUp/>}/>
                <Route path={'/login'} element={<Login/>}/>
                {/*<Route path={'/home'} element={<Home/>}/>*/}
                {/*<Route path='*' element={<PageNotFound/>}/>*/}
                <Route path='*' element={<Home/>}/>
            </Routes>
        </>
    )
}
