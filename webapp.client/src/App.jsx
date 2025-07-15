import { useEffect, useState, useRef } from "react";
import { Table } from "./Components/index";
import { Input, Button } from "./Components/Atoms/index";
import {Modal } from "./Components/Templates/index"

function App() {
    const socketRef = useRef(null);
    const [isSocketConnect, setIsSocketConnect] = useState(false);
    const [openRemoteForm, setOpenRemoteForm] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const originIdRef = useRef(null); 


    const createPayload = (instruction, message = undefined) => {
        const payload = JSON.stringify({
            Instruction: instruction,
            OriginId: originIdRef.current,
            Platform: "web",
            Message: message,
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



    const handleRemoteForm = (e) => {
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());
        const message = formDataObj.message || '';

        if (!socketRef.current || !originIdRef.current) return;
        let newState = !openRemoteForm;
        try {
            if (newState) {
                socketRef.current.send(createPayload("openForm", message));
            } else {
                socketRef.current.send(createPayload("closeForm", message));
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setOpenModal(false);
        }
    };

    const handleOpenRemoteFormModal = () => {
        setOpenModal(true);
    }

    return (
        <>
            <div className="h-screen w-screen bg-gray-900 overflow-hidden">
                <div className="flex flex-col h-full p-10 space-y-4">
                    <div className="h-1/10 text-white flex justify-between">
                        <div className={"flex flex-col justify-center items-start" }>
                            <h1 className="text-2xl font-bold">WebSocket Client</h1>
                            <p>Leonardo Lopez Perez</p>
                        </div>
                        <div className="flex items-center justify-end">
                            {!isSocketConnect ? (
                                <>Conexion cerrada</>
                            ) : (
                                <>
                                    <span className="font-semibold">WebSocket Status</span>
                                    <span className={`size-3 rounded-full mx-2 ${openRemoteForm ? "bg-green-500" : "bg-red-500"}`} />
                                    <Button onClick={handleOpenRemoteFormModal}>
                                        {openRemoteForm ? "Close Form" : "Open Form"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    <Table />
                </div>

            </div>
            {openModal &&
                <Modal
                    title={"Are you sure that want open windowsForm?"}
                    onClose={() => setOpenModal(false)}
                    onSubmit={handleRemoteForm }
                >
                <Input
                    label="Message"
                    name="message"
                    placeholder="Enter your message..."
                />
            </Modal>
            }
        </>
    );
}

export default App;
