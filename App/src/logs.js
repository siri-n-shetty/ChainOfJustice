import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, FileText } from 'lucide-react';

// Add default logs data
const defaultLogs = [
    {
        _id: '1',
        complaintId: 'CMP001',
        userName: 'Officer',
        userRole: 'officer',
        action: 'Viewed complaint details',
        timestamp: '2024-03-09T10:30:00'
    },
    {
        _id: '2',
        complaintId: 'CMP001',
        userName: 'Examiner',
        userRole: 'examiner',
        action: 'Reviewed complaint evidence',
        timestamp: '2024-03-09T11:45:00'
    },
    {
        _id: '3',
        complaintId: 'CMP002',
        userName: 'Officer',
        userRole: 'officer',
        action: 'Updated complaint status',
        timestamp: '2024-03-09T14:15:00'
    },
    {
        _id: '4',
        complaintId: 'CMP002',
        userName: 'Examiner',
        userRole: 'examiner',
        action: 'Added forensic analysis report',
        timestamp: '2024-03-09T16:20:00'
    }
];

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    // Modify the fetchLogs function
    const fetchLogs = async () => {
        try {
            setLoading(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLogs(defaultLogs);
        } catch (err) {
            setError('Failed to load logs');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-3xl font-bold text-white mb-6">Activity Logs</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <motion.div
                                key={log._id}
                                variants={itemVariants}
                                className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-500/20 p-2 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-white">
                                                Complaint #{log.complaintId}
                                            </h3>
                                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-400">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1" />
                                                    <span>{log.userRole} - {log.userName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-gray-300">
                                                {log.action}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        log.userRole === 'officer' 
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-green-500/20 text-green-400'
                                    }`}>
                                        {log.userRole}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Logs;