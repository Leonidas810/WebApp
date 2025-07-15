import { useEffect, useState, useRef } from "react";
import { Table } from "./components/Table";

function App() {
    const socketRef = useRef(null);
    const [isSocketConnect, setIsSocketConnect] = useState(false);
    const [openRemoteForm, setOpenRemoteForm] = useState(false);
    const inputContent = useRef('');
    const originIdRef = useRef(null); 


    const createPayload = (Instruction) => {
        const payload = JSON.stringify({
            Instruction: Instruction,
            OriginId: originIdRef.current,
            Platform: "web",
            Message: inputContent.current,
        })
        return payload;
    }

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:7239/ws");
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setIsSocketConnect(true);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            setIsSocketConnect(false);
            originIdRef.current = null;
        };

        socket.addEventListener("message", (e) => {
            try {
                const messageObj = JSON.parse(e.data);
                const { Instruction, id, OriginId, Platform } = messageObj;
                console.log(messageObj);

                if (Instruction === "connectAck") {
                    originIdRef.current = id;
                } else if (Instruction === "ackOpenForm") {
                    setOpenRemoteForm(true);
                } else if (Instruction === "ackCloseForm") {
                    setOpenRemoteForm(false);
                } else if (Instruction === "openForm") {
                    socketRef.current.send(createPayload("ackOpenForm"));
                    setOpenRemoteForm(true);
                } else if (Instruction === "closeForm") {
                    socketRef.current.send(createPayload("ackCloseForm"));
                    setOpenRemoteForm(false);
                } else {
                    console.error("Unknown instruction received:", Instruction);
                }
            } catch (error) {
                console.error("Error parsing message:", e.data, error);
            }
        });

        return () => socket.close();
    }, []);

    const handleRemoteForm = () => {
        if (!socketRef.current || !originIdRef.current) return;
        let newState = !openRemoteForm;
        try {
            if (newState) {
                socketRef.current.send(createPayload("openForm"));
            } else {
                socketRef.current.send(createPayload("closeForm"));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="h-screen w-screen bg-yellow-800">
            <div className="flex flex-col p-4 space-y-4 h-full">
                <div className="text-white">
                    <h1 className="text-2xl font-bold">WebSocket Client</h1>
                    <div className="flex items-center justify-end gap-2">
                        {!isSocketConnect ? (
                            <>Loading....</>
                        ) : (
                                <>
                                    <div className="flex flex-col gap-1 w-48">
                                        <label className="text-sm font-medium text-gray-100 mr-2">Message</label>
                                        <input
                                            type="text"
                                            className="bg-white text-gray-900 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                            onChange={(e) => inputContent.current = e.target.value}
                                            placeholder="Enter your message..."
                                        />
                                    </div>

                                <span className="font-semibold">WebSocket Status</span>
                                <span
                                    className={`size-3 rounded-full ${openRemoteForm ? "bg-green-500" : "bg-red-500"
                                        }`}
                                />
                                <button
                                    onClick={handleRemoteForm}
                                    className="px-4 py-2 rounded-lg text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700 active:scale-95"
                                >
                                    {openRemoteForm ? "Close" : "Open"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex-grow">
                    <Table />
                </div>
            </div>
        </div>
    );
}

export default App;
