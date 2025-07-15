export const Input = ({
    type = "text",
    label = undefined,
    name = undefined,
    placeholder=undefined,
    required = false,
    additionalClassname = undefined,
    onChange = undefined,
}) => {
    return (
        <div className="flex flex-col w-full">
            <label className="text-sm font-medium ml-1 mb-1" htmlFor={name}>{label} {required && <span className="ml-1 color-red-800">*</span>}</label>
            <input
                id={name}
                name={name}
                onChange={onChange }
                required={required }
                type={type}
                className={`bg-white text-gray-900 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${additionalClassname ? additionalClassname : ""}`}
                placeholder={placeholder }
            />
        </div>
    );
}