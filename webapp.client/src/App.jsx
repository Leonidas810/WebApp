import { useEffect, useState,useRef } from "react"

function App() {
    const socketRef = useRef(null);
    const [isSocketConnect, setIsSocketConnect] = useState(false);
    const [openRemoteForm, setOpenRemoteForm] = useState(false);

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
        };

        socket.addEventListener("message", (e) => {
            const instruction = e.data
            if (instruction === "ackOpenForm") {
                setOpenRemoteForm(true);
            } else if (instruction === "ackCloseForm") {
                setOpenRemoteForm(false);
            } else if (instruction === "openForm") {
                socketRef.current.send("ackOpenForm");
                setOpenRemoteForm(true);
            } else if (instruction === "closeForm") {
                socketRef.current.send("ackCloseForm");
                setOpenRemoteForm(false);
            }else {
                console.error("Unknown instruction received:", instruction);
            }
        });

        return () => socket.close();
    }, []);



    const handleRemoteForm = () => {
        if (!socketRef.current) return;
        let newState = !openRemoteForm;
        try {
            if (newState) {
                socketRef.current.send("openForm");
            } else {
                socketRef.current.send("closeForm");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };



    return (
        <div className="h-screen w-screen bg-gray-800 text-white">
            <div className="grid grid-cols-3 grid-rows-5 h-full p-4">
                <div className="col-span-2">
                    <h1 className="text-2xl font-bold">WebSocket Client</h1>
                </div>
                <div className="">
                        {!isSocketConnect
                            ? <>Loading....</>
                            : 
                        <>
                            <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold">WebSocket Status</span>
                                <span className={`size-3 rounded-full ${openRemoteForm ? "bg-green-500" : "bg-red-500"}`} />
                                <button
                                    onClick={handleRemoteForm}
                                    className="px-4 py-2 rounded-lg text-white transition-colors duration-300 bg-blue-600 hover:bg-blue-700 active:scale-95">
                                    {openRemoteForm ? "Close" : "Open"}
                                </button>
                            </div>

                            
                        </>
                         }
                </div>
                <div className="col-span-3">
                   <div>
                      tabla
                   </div>
                </div>
            </div>
        </div>
   )
}

export default App;