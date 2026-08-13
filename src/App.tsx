import {Route, Routes} from 'react-router-dom'
import './styles/App.css'

import Home from './pages/home.tsx'


export default function App() {

    return (
        <>
            <Routes>
                {/*<Route path={'/'} element={<Login/>}/>*/}
                <Route path={'/home'} element={<Home/>}/>

            </Routes>
        </>
    )
}
