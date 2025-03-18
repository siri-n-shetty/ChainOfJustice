import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, FileText, LogOut, Upload, Camera, X, AlertCircle, Search, Filter, Clock } from 'lucide-react';
import Webcam from 'react-webcam';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    place: '',
    complaintDetails: '',
    evidenceDetails: '',
    casecategory: '',
    severity: 'Medium',
    files: [],
    complaintNo: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Categories for dropdown
  const categories = ['Theft', 'Assault', 'Fraud', 'Harassment', 'Vandalism', 'Burglary', 'Other'];
  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'officer') {
      navigate('/login');
      return;
    }
    
    // Fetch complaints
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/api/complaints', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        throw new alert('No Logs');
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      files: [...e.target.files]
    });
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);
    setFormData({
      ...formData,
      files: updatedFiles
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.complaintNo.trim()) errors.complaintNo = 'Complaint ID is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.place.trim()) errors.place = 'Place is required';
    if (!formData.complaintDetails.trim()) errors.complaintDetails = 'Complaint details are required';
    if (!formData.casecategory) errors.casecategory = 'Category is required';
    
    // Add validation for complaint ID format if needed
    const complaintIdPattern = /^[A-Z0-9-]+$/; // Example pattern
    if (formData.complaintNo && !complaintIdPattern.test(formData.complaintNo)) {
      errors.complaintNo = 'Invalid complaint ID format. Use uppercase letters, numbers and hyphens only.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('complaintNo', formData.complaintNo); // Add this line
      formDataObj.append('title', formData.title);
      formDataObj.append('date', formData.date);
      formDataObj.append('place', formData.place);
      formDataObj.append('complaintDetails', formData.complaintDetails);
      formDataObj.append('evidenceDetails', formData.evidenceDetails);
      formDataObj.append('casecategory', formData.casecategory);
      formDataObj.append('severity', formData.severity);
      
      // Append each file
      formData.files.forEach((file, index) => {
        formDataObj.append(`file${index}`, file);
      });
      
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formDataObj
      });
      
      if (response.ok) {
        // Reset form and close modal
        setFormData({
          complaintNo: '',  // Add this line
          title: '',
          date: new Date().toISOString().split('T')[0],
          place: '',
          complaintDetails: '',
          evidenceDetails: '',
          casecategory: '',
          severity: 'Medium',
          files: []
        });
        setShowCreateModal(false);
        fetchComplaints(); // Refresh complaints list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create complaint');
      }
    } catch (err) {
      console.error('Error creating complaint:', err);
      setError(err.message || 'Failed to create complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (complaint) => {
    setCurrentComplaint(complaint);
    setShowViewModal(true);
  };

  const handleCapture = (imageSrc) => {
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setFormData({
          ...formData,
          files: [...formData.files, file]
        });
      });
    setShowWebcam(false);
  };

  const filteredComplaints = complaints.filter(complaint => {
    // Add null checks for complaint and its properties
    if (!complaint) return false;
    const category = complaint.casecategory || '';
    const title = complaint.title || '';
    const details = complaint.complaintDetails || '';
    
    const matchesSearch = searchTerm === '' || 
                         title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white flex flex-col">
      {/* Blockchain-inspired background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full grid grid-cols-12 grid-rows-6">
          {Array(72).fill().map((_, i) => (
            <div key={i} className="border border-white/10"></div>
          ))}
        </div>
      </div>
      
      {/* Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between bg-black/30 backdrop-blur-sm border-b border-blue-500/20">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">
            Hash<span className="text-blue-400">Proof</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-gray-300">
            <span className="opacity-70">Logged in as </span>
            <span className="font-medium text-blue-300">Officer</span>
          </div>
          
          {/* Add this new logs button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/logs')}
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm">View Logs</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center space-x-1 text-gray-300 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </motion.button>
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <motion.h1 variants={itemVariants} className="text-3xl font-bold mb-4 md:mb-0">
            Officer Dashboard
          </motion.h1>
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg flex items-center space-x-2 max-w-xs md:max-w-none"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Complaint</span>
          </motion.button>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center text-sm"
          >
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {/* Filters */}
        <motion.div 
          variants={containerVariants}
          className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0"
        >
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="py-2 px-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('');
            }}
            className="py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-sm"
          >
            Clear Filters
          </motion.button>
        </motion.div>
        
        {/* Complaints list */}
        <motion.div 
          variants={containerVariants}
          className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl overflow-hidden"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-t-2 border-blue-500 border-r-2 border-blue-500 rounded-full mb-4"></div>
              <p className="text-gray-400">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No complaints found</h3>
              <p className="text-gray-400 mb-6">
                {complaints.length === 0 
                  ? "You haven't created any complaints yet." 
                  : "No complaints match your search criteria."}
              </p>
              {complaints.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Complaint</span>
                </motion.button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredComplaints.map((complaint) => (
                    <motion.tr 
                      key={complaint.complaintNo || `complaint-${Math.random()}`}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.complaintNo || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{complaint.title || 'Untitled'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.date || 'No date'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{complaint.casecategory || 'Uncategorized'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${complaint.severity === 'Low' ? 'bg-green-500/20 text-green-400' : 
                            complaint.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                            complaint.severity === 'High' ? 'bg-orange-500/20 text-orange-400' : 
                            'bg-red-500/20 text-red-400'}`}
                        >
                          {complaint.severity || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openViewModal(complaint)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Details
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-blue-500/20 py-4 px-6 text-center text-gray-500 text-sm">
        <p>© 2025 HashProof. All rights reserved.</p>
      </footer>
      
      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowCreateModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 border border-blue-500/30 rounded-xl shadow-xl z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Complaint</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="complaintNo" className="block text-gray-300 mb-2 text-sm font-medium">
                    Complaint ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="complaintNo"
                    name="complaintNo"
                    type="text"
                    value={formData.complaintNo}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.complaintNo ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                    placeholder="Enter complaint ID"
                  />
                  {formErrors.complaintNo && <p className="mt-1 text-sm text-red-500">{formErrors.complaintNo}</p>}
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-gray-300 mb-2 text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.title ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                    placeholder="Complaint title"
                  />
                  {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
                </div>
                
                <div>
                  <label htmlFor="date" className="block text-gray-300 mb-2 text-sm font-medium">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.date ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                  />
                  {formErrors.date && <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>}
                </div>
                
                <div>
                  <label htmlFor="place" className="block text-gray-300 mb-2 text-sm font-medium">
                    Place <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="place"
                    name="place"
                    type="text"
                    value={formData.place}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.place ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                    placeholder="Location of incident"
                  />
                  {formErrors.place && <p className="mt-1 text-sm text-red-500">{formErrors.place}</p>}
                </div>
                
                <div>
                  <label htmlFor="casecategory" className="block text-gray-300 mb-2 text-sm font-medium">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="casecategory"
                    name="casecategory"
                    value={formData.casecategory}
                    onChange={handleInputChange}
                    className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.casecategory ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.casecategory && <p className="mt-1 text-sm text-red-500">{formErrors.casecategory}</p>}
                </div>
                
                <div>
                  <label htmlFor="severity" className="block text-gray-300 mb-2 text-sm font-medium">
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 rounded-lg bg-gray-700/70 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                  >
                    {severityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="complaintDetails" className="block text-gray-300 mb-2 text-sm font-medium">
                  Complaint Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="complaintDetails"
                  name="complaintDetails"
                  value={formData.complaintDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className={`block w-full px-3 py-2 rounded-lg bg-gray-700/70 border ${formErrors.complaintDetails ? 'border-red-500' : 'border-gray-600'} focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white`}
                  placeholder="Detailed description of the complaint"
                ></textarea>
                {formErrors.complaintDetails && <p className="mt-1 text-sm text-red-500">{formErrors.complaintDetails}</p>}
              </div>
              
              <div className="mb-6">
                <label htmlFor="evidenceDetails" className="block text-gray-300 mb-2 text-sm font-medium">
                  Evidence Details
                </label>
                <textarea
                  id="evidenceDetails"
                  name="evidenceDetails"
                  value={formData.evidenceDetails}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-3 py-2 rounded-lg bg-gray-700/70 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none text-white"
                  placeholder="Any evidence related information"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 text-sm font-medium">
                  Upload Evidence Images
                </label>
                <div className="flex items-center justify-center w-full gap-4">
                  <label className="flex flex-col w-full h-32 border-2 border-blue-500/30 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWebcam(true)}
                    className="flex flex-col items-center justify-center h-32 px-4 border-2 border-blue-500/30 rounded-lg hover:bg-gray-700/30 transition-colors"
                  >
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Capture</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Use Webcam
                    </p>
                  </motion.button>
                </div>
                
                {/* Existing files preview code */}
                {formData.files.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from(formData.files).map((file, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Evidence ${index + 1}`} 
                          className="h-24 w-full object-cover rounded-lg border border-gray-600"
                        />
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-700 space-x-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  className={`py-2 px-6 ${submitting ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} rounded-lg text-white font-medium flex items-center space-x-2`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Complaint</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* View Complaint Modal */}
      {showViewModal && currentComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowViewModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 border border-blue-500/30 rounded-xl shadow-xl z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Title</h3>
                <p className="text-gray-400">{currentComplaint.title}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Date</h3>
                <p className="text-gray-400">{currentComplaint.date}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Place</h3>
                <p className="text-gray-400">{currentComplaint.place}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Category</h3>
                <p className="text-gray-400">{currentComplaint.casecategory}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Severity</h3>
                <p className="text-gray-400">{currentComplaint.severity}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Complaint Details</h3>
                <p className="text-gray-400">{currentComplaint.complaintDetails}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300">Evidence Details</h3>
                <p className="text-gray-400">{currentComplaint.evidenceDetails}</p>
              </div>
              
              {currentComplaint.files && currentComplaint.files.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-300">Evidence Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {currentComplaint.files.map((file, index) => (
                      <img 
                        key={index}
                        src={file}
                        alt={`Evidence ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg border border-gray-600"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Add Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowWebcam(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 border border-blue-500/30 rounded-xl shadow-xl z-10 w-full max-w-lg"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">Capture Evidence</h3>
              <button
                onClick={() => setShowWebcam(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              >
                {({ getScreenshot }) => (
                  <div className="mt-4 flex justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const imageSrc = getScreenshot();
                        if (imageSrc) {
                          handleCapture(imageSrc);
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded-lg flex items-center space-x-2"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Capture Photo</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowWebcam(false)}
                      className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </motion.button>
                  </div>
                )}
              </Webcam>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;