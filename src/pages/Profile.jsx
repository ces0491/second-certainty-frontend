import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, loading, error, updateProfile, changePassword } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    date_of_birth: '',
    is_provisional_taxpayer: false,
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize form data when user data loads
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        surname: currentUser.surname || '',
        email: currentUser.email || '',
        date_of_birth: currentUser.date_of_birth || '',
        is_provisional_taxpayer: currentUser.is_provisional_taxpayer || false,
      });
    }
  }, [currentUser]);

  // Auto-dismiss success messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (passwordSuccess) {
      const timer = setTimeout(() => setPasswordSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccess]);

  // Profile edit handlers
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    // Clear errors when user starts typing
    if (formError) setFormError('');
  };

  // Password change handlers
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
  };

  // Handle editing mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data to original values when cancelling
      if (currentUser) {
        setFormData({
          name: currentUser.name || '',
          surname: currentUser.surname || '',
          email: currentUser.email || '',
          date_of_birth: currentUser.date_of_birth || '',
          is_provisional_taxpayer: currentUser.is_provisional_taxpayer || false,
        });
      }
      setFormError('');
      setSuccessMessage('');
    }
    setIsEditing(!isEditing);
  };

  // Handle password form toggle
  const handlePasswordFormToggle = () => {
    if (showPasswordForm) {
      // Reset password form when closing
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setPasswordError('');
      setPasswordSuccess('');
    }
    setShowPasswordForm(!showPasswordForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Client-side validation
    if (!formData.name?.trim() || !formData.surname?.trim()) {
      setFormError('Name and surname are required');
      return;
    }

    if (!formData.date_of_birth) {
      setFormError('Date of birth is required');
      return;
    }

    // Validate date of birth is in the past
    const birthDate = new Date(formData.date_of_birth);
    if (birthDate >= new Date()) {
      setFormError('Date of birth must be in the past');
      return;
    }

    setIsUpdating(true);

    try {
      // Prepare data for API (exclude email as it can't be changed)
      const updateData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        date_of_birth: formData.date_of_birth,
        is_provisional_taxpayer: formData.is_provisional_taxpayer,
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setFormError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (!passwordData.current_password) {
      setPasswordError('Current password is required');
      return;
    }

    setIsChangingPassword(true);

    try {
      const passwordChangeData = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      };

      const result = await changePassword(passwordChangeData);

      if (result.success) {
        // Reset form
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });

        setPasswordSuccess('Password changed successfully!');
        setShowPasswordForm(false);
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError(
        err.message ||
          'Failed to change password. Please check your current password and try again.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sc-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-sc-green text-white p-6 rounded-lg flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-sc-green-100">Manage your account information and settings</p>
        </div>
        <button
          className="bg-white text-sc-green px-4 py-2 rounded-md font-medium hover:bg-sc-green-50 transition-colors"
          onClick={handleEditToggle}
          disabled={isUpdating}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Success Messages */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {passwordSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{passwordSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="bg-sc-green text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </div>

        <div className="p-6">
          {/* Error Messages */}
          {formError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
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
                    Last Name *
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
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                    value={formData.email}
                    disabled
                    title="Email cannot be changed for security reasons"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_provisional_taxpayer"
                      name="is_provisional_taxpayer"
                      className="h-4 w-4 text-sc-green focus:ring-sc-green border-gray-300 rounded"
                      checked={formData.is_provisional_taxpayer}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="is_provisional_taxpayer"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      I am a provisional taxpayer
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {formData.date_of_birth
                    ? new Date(formData.date_of_birth).toLocaleDateString('en-ZA')
                    : 'Not provided'}
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

      {/* Account Security */}
      <div className="bg-white shadow rounded-lg">
        <div className="bg-sc-green text-white px-6 py-4">
          <h2 className="text-lg font-semibold">Account Security</h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
            <p className="text-sm text-gray-600 mb-4">
              For security reasons, please use a strong password that you don't use elsewhere.
            </p>
          </div>

          {!showPasswordForm ? (
            <button
              className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors"
              onClick={handlePasswordFormToggle}
              disabled={isChangingPassword}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Password Error Messages */}
              {passwordError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{passwordError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="current_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sc-green focus:border-sc-green sm:text-sm"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="bg-sc-green hover:bg-sc-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sc-green transition-colors disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordFormToggle}
                    disabled={isChangingPassword}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
