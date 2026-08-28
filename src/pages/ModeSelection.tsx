import {useNavigate} from "react-router-dom";

export default function ModeSelection()
{
    const navigate = useNavigate();

    return (
        <>
            <button onClick={() => navigate('/login')}>Singleplayer</button>
            <button onClick={() => navigate('/multiplayer')}>Multiplayer</button>
        </>
    )
}