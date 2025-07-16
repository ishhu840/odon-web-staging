import React, { useState } from 'react';
import axios from 'axios';


const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const response = await axios.post(`${API}/contact`, formData);
      setStatus(response.data.message);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setStatus(`Failed to send message: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-green-800 mb-4">Contact Us</h1>
      <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto">
        Get in touch with Dr. Valerie Odon and the research team. We welcome collaborations,
        inquiries, and academic discussions.
      </p>

      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Send us a Message</h2>
          <p className="text-gray-600 mb-6">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Send Message
            </button>
            {status && <p className="mt-4 text-center text-sm text-gray-600">{status}</p>}
          </form>
        </div>
    </div>
  );
}

export default ContactPage;