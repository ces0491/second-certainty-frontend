// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/common/Alert';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const Profile = () => {
  const { currentUser, loading, error, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    date_of_birth: '',
    is_provisional_taxpayer: false
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        surname: currentUser.surname || '',
        email: currentUser.email || '',
        date_of_birth: currentUser.date_of_birth || '',
        is_provisional_taxpayer: currentUser.is_provisional_taxpayer || false
      });
    }
  }, [currentUser]);
  
  // Profile edit handlers
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  // Password change handlers
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    
    // THIS DOESN'T WORK
    // Implement update profile logic
    // ...
    
    setSuccessMessage('Profile updated successfully!');
    setIsEditing(false);
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // THIS DOESN'T WORK
      // Implement password change API call here
      // Eg:
      // await api.post('/auth/change-password', passwordData);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordSuccess('Password changed successfully!');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError('Failed to change password. Please check your current password and try again.');
    }
  };
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">User Profile</h1>
      
      {error && <Alert type="error" message={error} />}
      {formError && <Alert type="error" message={formError} onDismiss={() => setFormError('')} />}
      {successMessage && <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-sc-green flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          <button
            className="bg-white text-sc-green px-4 py-2 rounded-md font-medium hover:bg-sc-green-50 transition-colors"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                  <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
                </div>
                
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="is_provisional_taxpayer"
                      name="is_provisional_taxpayer"
                      type="checkbox"
                      className="h-4 w-4 text-sc-green focus:ring-sc-green border-gray-300 rounded"
                      checked={formData.is_provisional_taxpayer}
                      onChange={handleChange}
                    />
                    <label htmlFor="is_provisional_taxpayer" className="ml-2 block text-sm text-gray-900">
                      I am a provisional taxpayer
                    </label>
                  </div>
                </div>
                
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" variant="primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">First Name</p>
                <p className="text-lg font-medium text-gray-800">{formData.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Last Name</p>
                <p className="text-lg font-medium text-gray-800">{formData.surname}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-lg font-medium text-gray-800">{formData.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-lg font-medium text-gray-800">
                  {new Date(formData.date_of_birth).toLocaleDateString('en-ZA')}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Provisional Taxpayer Status</p>
                <p className="text-lg font-medium text-gray-800">
                  {formData.is_provisional_taxpayer ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Password Change Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-sc-green">
          <h2 className="text-xl font-bold text-white">Account Security</h2>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
          <p className="text-gray-600 mb-4">
            For security reasons, please use a strong password that you don't use elsewhere.
          </p>
          
          {passwordError && <Alert type="error" message={passwordError} onDismiss={() => setPasswordError('')} />}
          {passwordSuccess && <Alert type="success" message={passwordSuccess} onDismiss={() => setPasswordSuccess('')} />}
          
          {showPasswordForm ? (
            <form onSubmit={handlePasswordSubmit} className="mt-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors"
                  >
                    Change Password
                  </button>
                  <button variant="gray" onClick={() => setShowPasswordForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;