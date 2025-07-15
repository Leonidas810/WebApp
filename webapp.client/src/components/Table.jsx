import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const Table = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('https://localhost:7239/api/records');
            setRecords(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    return (
        <div className="w-full px-4 py-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Records</h2>
                <button
                    onClick={fetchRecords}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Refetch
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {!loading && records.length === 0 && <p>No data</p>}

            {!loading && records.length > 0 && (
                <div className="w-full max-w-full overflow-x-auto">
                    <div className="max-h-[700px] overflow-y-auto">
                        <table className="min-w-full table-auto border-collapse border border-gray-200">
                            <thead className="bg-gray-100 sticky top-0 z-10">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">ID</th>
                                    <th className="border border-gray-300 px-4 py-2">Platform</th>
                                    <th className="border border-gray-300 px-4 py-2">Action</th>
                                    <th className="border border-gray-300 px-4 py-2">DateTime</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id} className="text-center">
                                        <td className="border border-gray-300 px-4 py-2">{record.id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{record.platform}</td>
                                        <td className="border border-gray-300 px-4 py-2">{record.action}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {new Date(record.dateTime).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
