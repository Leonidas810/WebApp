import { useEffect, useState, useCallback,useRef } from 'react';
import axios from 'axios';
import { Modal } from "./Templates/index"
import { Input,Button, LoadingSpinner } from './Atoms/index';

export const Table = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const selectedRecordRef = useRef(null);

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

    const handleEditModal = async (e) => {
        e.preventDefault();
        setLoadingPost(true);
        const formData = new FormData(e.target);
        const formDataObj = Object.fromEntries(formData.entries());

        const { platform, dateTime } = formDataObj;

        const recordToUpdate = {
            id: selectedRecordRef.current,
            ...(platform ? { platform: platform } : {}),
            ...(dateTime ? { dateTime: new Date(dateTime).toISOString() } : {})
        };

        try {
            const response = await fetch('https://localhost:7239/api/records', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recordToUpdate)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }
            await fetchRecords();


        } catch (err) {
            console.error('Error updating record:', err);
        } finally {
            setLoadingPost(false)
            setOpenModal(false);
        }
    };

    const handleOpenEditModal = (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const recordId = tr.getAttribute('data-id');
        selectedRecordRef.current = parseInt(recordId);
        setOpenModal(true);
    };

    return (
        <>
            <div className="w-full h-8/10">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Records</h2>
                    <Button loading={loading} type="button" onClick={fetchRecords}>
                        Refetch
                    </Button>
                </div>

                {loading && <LoadingSpinner />}
                {error && <p className="text-red-600"> {error}</p>}
                {!loading && records.length === 0 && <p>No data</p>}
                {!loading && records.length > 0 && (
                    <div className="w-full h-full max-w-full overflow-x-auto">
                        <div className="max-h-full h-full overflow-y-auto">
                            <table className="min-w-full table-auto border-collapse border border-gray-200 bg-white">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2">ID</th>
                                        <th className="border border-gray-300 px-4 py-2">Platform</th>
                                        <th className="border border-gray-300 px-4 py-2">Action</th>
                                        <th className="border border-gray-300 px-4 py-2">DateTime</th>
                                    </tr>
                                </thead>
                                <tbody onClick={handleOpenEditModal}> 
                                    {records.map(record => (
                                        <tr data-id={record.id} key={record.id} className="text-center hover:bg-gray-200 cursor-pointer">
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
            {openModal &&
                <Modal
                    onSubmitLoading={loadingPost}
                    title="Edit Modal"
                    onClose={() => setOpenModal(false)}
                    onSubmit={handleEditModal}                >
                    <Input
                        label="Platform"
                        name="platform"
                        placeholder="Enter new platform..."
                    />
                    <Input
                        type="datetime-local"
                        label="DateTime"
                        name="dateTime"
                        placeholder="Enter new date..."
                    />
            </Modal>}
        </>
    );
};
