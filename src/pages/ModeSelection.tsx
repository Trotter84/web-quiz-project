import {useNavigate} from "react-router-dom";
import "../styles/modeSelection.css";

export default function ModeSelection() {
    const navigate = useNavigate();

    return (
        <div className="mode-selection-page">
            <h1>Trivia's John</h1>
            <button className="mode-selection-button" onClick={() => navigate('/login')}>Singleplayer</button>
            <button className="mode-selection-button" onClick={() => navigate('/multiplayer')}>Multiplayer</button>
        </div>
    )
}