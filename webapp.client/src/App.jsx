import { useEffect, useState,useRef } from "react"

function App() {
    const socketRef = useRef(null);
    const [openRemoteForm, setOpenRemoteForm] = useState(false);

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:7239/ws");
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
        };

        return () => socket.close();
    }, []);



    const handleRemoteForm = () => {
        if (!socketRef.current) return;
        setOpenRemoteForm((p) => !p);
        socketRef.current.send("triggerWindow");
    }


    return (
        <div className="h-screen w-screen bg-red-900">
            <div className="flex justify-center items-center h-full">
                <button
                    onClick={handleRemoteForm}
                    className="cursor-pointer p-4 bg-white hover:bg-gray-200 rounded-md"
                >
                    {openRemoteForm ? "Cerrar" : "Abrir"}
                </button>
            </div>
        </div>

   )
}

export default App;