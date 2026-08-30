import {createContext, useContext, useEffect, useState, type ReactNode} from "react";
import {io, Socket} from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

interface SocketContextValue {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({socket: null, connected: false});

export function SocketProvider({children}: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected. Socket ID: " + newSocket.id);
            setConnected(true);

        });

        newSocket.on("disconnect", () => {
            console.log("Disconnected from server");
            setConnected(false);
        });

        return () => {
            newSocket.disconnect();
        };

    }, []);

    return (
        <SocketContext.Provider value={{socket, connected}}>
            {children}
        </SocketContext.Provider>
    );

}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
    return useContext(SocketContext);
}