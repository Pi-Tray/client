import { createContext, useContext, useEffect, useState } from 'react';

const WSContext = createContext<WebSocket | null>(null);

interface WSProviderProps {
    url: string;
    children: React.ReactNode;
}

export const WSProvider = ({ url, children }: WSProviderProps) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(url);
        setSocket(ws);

        return () => ws.close();
    }, [url]);

    return <WSContext.Provider value={socket}>{children}</WSContext.Provider>;
};

export const useWebSocket = () => {
    return useContext(WSContext);
};
