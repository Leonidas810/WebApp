import { useEffect } from "react"; 
import { Button } from "../Atoms/index";

export const Modal = (
    {
        title,
        onClose = undefined,
        onSubmit = undefined,
        onSubmitLoading=false,
        onSubmitButtonText="Send",
        children,
    }) => {

    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleEscapeKey);
        return () => {
            window.removeEventListener("keydown", handleEscapeKey);
        }
    }, [])

    const handleOnSubmit = (e) => {
        e.preventDefault();
        if (!onSubmit) return
        onSubmit(e);
    }


    return (
        <>
            <div className={`z-90 fixed top-0 left-0 h-screen w-screen bg-black opacity-25 pointer-events-none`} />
            <div className={`z-100 fixed top-0 left-0 w-screen h-screen flex items-center justify-center`}>
                <form onSubmit={handleOnSubmit}
                    className={"relative bg-white w-1/2 h-auto p-4 rounded-md space-y-4"}>
                    <button type="button" onClick={onClose} className="absolute top-4 right-4">x</button>
                    <h1 className="text-2xl">{title}</h1>
                    {children}
                    <div className="flex justify-end gap-x-2">
                        <Button disabled={onSubmitLoading} type={"button"} onClick={onClose}>
                            {"Cancell"}
                        </Button>
                        <Button loading={onSubmitLoading} type={"submit"} level="secondary">
                            {onSubmitButtonText}
                        </Button>
                    </div>
                </form>
            </div>
        </> 
    )

}