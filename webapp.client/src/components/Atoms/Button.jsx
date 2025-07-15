import { LoadingSpinner } from "./LoadingAnimation"

export const Button = ({
    type = "button",
    level = "primary",
    additionalClassname = undefined,
    onClick = undefined,
    loading = false,
    disabled = false,
    children
}) => {
    const buttonLevel = {
        primary: "bg-blue-600 hover:bg-blue-700",
        secondary: "bg-gray-600 hover:bg-gray-700",
        danger: "bg-red-600 hover:bg-red-700"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`cursor-pointer px-4 py-2 rounded-lg text-white transition-colors duration-300 active:scale-95
                ${buttonLevel[level]}
                ${additionalClassname ? additionalClassname : ""}
                ${(loading || disabled) ? "opacity-50 cursor-not-allowed hover:bg-opacity-50" : ""}
            `}
        >
            {loading ? <LoadingSpinner /> : children}
        </button>
    );
};
