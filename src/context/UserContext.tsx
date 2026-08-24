import { createContext, useContext, useState, useEffect } from "react";
import * as React from "react";

interface UserContextType {
    username: string | null;
    login: (username: string) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode })
{
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() =>
    {
        const savedUser = localStorage.getItem("activeUsername");
        if (savedUser)
        {
            setUsername(savedUser);
        }
    }, []);

    const login = (name: string) =>
    {
        setUsername(name);
        localStorage.setItem("activeUsername", name);
    }

    const logout = () =>
    {
        setUsername(null);
        localStorage.removeItem("activeUsername");
    }

    return (<UserContext.Provider value={{ username, login, logout }}> {children} </UserContext.Provider>);

}
export function useUser()
{
    const context = useContext(UserContext);
    if (!context)
    {
        throw new Error("useUser must be used within the context");
    }
    return context;
}