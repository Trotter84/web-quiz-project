import { Route, Routes } from 'react-router-dom'
import './styles/App.css'

import Home from './pages/home.tsx'
import QuizScreen from "./pages/quizScreen.tsx";


export default function App() {

  return (
    <>
        <Routes>
            {/*<Route path={'/'} element={<Login/>}/>*/}
            <Route path={'/home'} element={<Home/>}/>
            <Route path={'/quizScreen'} element={<QuizScreen/>}/>
        </Routes>
    </>
  )
}
