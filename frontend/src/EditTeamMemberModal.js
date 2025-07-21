import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EditTeamMemberModal = ({ isOpen, onClose, onSave, member, token }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    interests: '',
    bio: '',
    order: 0,
    is_published: true,
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        role: member.role || '',
        image: member.image || '',
        interests: member.interests ? member.interests.join(', ') : '',
        bio: member.bio || '',
        order: member.order || 0,
        is_published: member.is_published || true,
      });
    } else {
      setFormData({
        name: '',
        role: '',
        image: '',
        interests: '',
        bio: '',
        order: 0,
        is_published: true,
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        interests: formData.interests.split(',').map(item => item.trim()).filter(item => item !== ''),
        order: parseInt(formData.order, 10),
      };

      if (member) {
        // Update existing member
        await axios.put(`${API}/team_members/${member.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Team member updated successfully!');
      } else {
        // Create new member
        await axios.post(`${API}/team_members`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Team member created successfully!');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Failed to save team member: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-blue-500/20 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
          <h2 className="text-2xl font-bold text-white">{member ? 'Edit Team Member' : 'Add New Team Member'}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-blue-100 text-sm font-bold mb-2">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-blue-100 text-sm font-bold mb-2">Role:</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-blue-100 text-sm font-bold mb-2">Image URL:</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
              />
            </div>
            <div>
              <label htmlFor="interests" className="block text-blue-100 text-sm font-bold mb-2">Interests (comma-separated):</label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-blue-100 text-sm font-bold mb-2">Bio:</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
              ></textarea>
            </div>
            <div>
              <label htmlFor="order" className="block text-blue-100 text-sm font-bold mb-2">Order:</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline bg-slate-200"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="mr-2 leading-tight"
              />
              <label htmlFor="is_published" className="text-blue-100 text-sm font-bold">Published</label>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamMemberModal;