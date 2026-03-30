import React, { useState } from 'react';
import userService from './userService.js';

const ProfilePage = ({ user, onUserUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Local state for forms
  const [children, setChildren] = useState(user?.children || []);
  const [vehicleDetails, setVehicleDetails] = useState(user?.vehicleDetails || '');
  const [status, setStatus] = useState(user?.status || 'active');

  const handleAddChild = () => {
    setChildren([...children, { name: '' }]);
  };

  const handleChildChange = (index, value) => {
    const newChildren = [...children];
    newChildren[index].name = value;
    setChildren(newChildren);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let response;
      if (user.role === 'parent') {
        response = await userService.updateParentChildren(children);
      } else if (user.role === 'driver') {
        response = await userService.updateDriverInfo({ vehicleDetails, status });
      }

      setMessage('Profile updated successfully!');
      if (onUserUpdate) onUserUpdate(response.data.user);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>User Profile: {user.name}</h2>
      <p>Email: {user.email} | Role: {user.role}</p>

      <form onSubmit={handleUpdate}>
        {user.role === 'parent' && (
          <div className="section">
            <h3>Children Management</h3>
            {children.map((child, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={child.name}
                  placeholder="Child Name"
                  onChange={(e) => handleChildChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={handleAddChild}>+ Add Child</button>
          </div>
        )}

        {user.role === 'driver' && (
          <div className="section">
            <h3>Vehicle & Status</h3>
            <label>Vehicle Details:</label>
            <input value={vehicleDetails} onChange={(e) => setVehicleDetails(e.target.value)} />
            <label>Current Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-trip">On Trip</option>
            </select>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ProfilePage;