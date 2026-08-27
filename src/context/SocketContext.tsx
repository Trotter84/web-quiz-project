import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

interface SocketContextValue
{
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({socket: null, connected: false});

export function SocketProvider({ children }: { children: ReactNode })
{
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() =>
    {
       const socket = io(SOCKET_URL);
       socketRef.current = socket;

       socket.on("connect", () =>
       {
           console.log("Connected. Socket ID: " + socket.id);
           setConnected(true);

       });

       socket.on("disconnect", () =>
       {
          console.log("Disconnected from server");
          setConnected(false);
       });

       return () => {
           socket.disconnect();
       };

    }, []);

    return (
      <SocketContext.Provider value={{ socket: socketRef.current, connected}}>
          {children}
      </SocketContext.Provider>
    );

}
export function useSocket()
{
    return useContext(SocketContext);
}