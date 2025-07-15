import React, { createContext, useState, useEffect, useRef, useCallback } from "react";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const socketRef = useRef(null);

    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [clientId, setClientId] = useState(null);
    const [openRemoteForm, setOpenRemoteForm] = useState(false);

    const sendMessage = useCallback(
        (instruction) => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                const messageObj = {
                    instruction,
                    originId: clientId,
                    platform: "web",
                };
                socketRef.current.send(JSON.stringify(messageObj));
            }
        },
        [clientId]
    );

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:7239/ws");
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsSocketConnected(true);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            setIsSocketConnected(false);
            setClientId(null);
        };

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);

                if (data.instruction === "connectAck" && data.id) {
                    console.log("Received connectAck with id:", data.id);
                    setClientId(data.id);
                    localStorage.setItem("websocket-client-id", data.id);
                } else if (data.instruction === "ackOpenForm") {
                    setOpenRemoteForm(true);
                } else if (data.instruction === "ackCloseForm") {
                    setOpenRemoteForm(false);
                } else if (data.instruction === "openForm") {
                    sendMessage("ackOpenForm");
                    setOpenRemoteForm(true);
                } else if (data.instruction === "closeForm") {
                    sendMessage("ackCloseForm");
                    setOpenRemoteForm(false);
                } else {
                    console.warn("Unknown instruction received:", data);
                }
            } catch (error) {
                console.error("Failed to parse message:", e.data, error);
            }
        };

        return () => {
            socket.close();
        };
    }, [sendMessage]);

    return (
        <WebSocketContext.Provider
            value={{
                isSocketConnected,
                clientId,
                openRemoteForm,
                sendMessage,
                setOpenRemoteForm,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};
