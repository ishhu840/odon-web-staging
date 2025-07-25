import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhoneVolume,
  faPaperPlane,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faLinkedinIn,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";
import axios from "axios";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBiFN_xbGPvHlkt3fVJd-lgI0eIJ-zAgD8&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);

    window.initMap = () => {
      const mapOptions = {
        center: { lat: 55.862885, lng: -4.241636 }, // Coordinates for 161 Cathedral Street, Glasgow G4 0RE, Scotland, UK
        zoom: 12,
      };
      const map = new window.google.maps.Map(document.getElementById("map"), mapOptions);

      new window.google.maps.Marker({
        position: mapOptions.center,
        map: map,
        title: '161 Cathedral Street, Glasgow G4 0RE, Scotland, UK'
      });
    };
  }, []);

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-10">

      <div className="md:col-span-1 bg-white bg-opacity-60 backdrop-filter backdrop-blur-xl p-10 rounded-xl shadow-3xl border border-white border-opacity-30 transform transition-transform duration-300 hover:shadow-4xl hover:scale-[1.005] hover:-translate-y-1 relative z-10">
        <h1 className="text-5xl font-extrabold text-center md:text-left text-blue-500 mb-6 animate-fade-in-down">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">FULL NAME</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">SUBJECT</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">MESSAGE</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              rows="6"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transform transition-all duration-300 ease-in-out hover:scale-105 shadow-lg"
          >
            Send Message
          </button>
          {status && <p className="mt-4 text-center text-gray-800">{status}</p>}
        </form>
      </div>

      <div className="md:col-span-1 bg-white bg-opacity-60 backdrop-filter backdrop-blur-xl p-10 rounded-xl shadow-3xl border border-white border-opacity-30 transform transition-transform duration-300 hover:shadow-4xl hover:scale-[1.005] hover:-translate-y-1 relative z-10">
        <div id="map" className="w-full h-96 rounded-xl shadow-3xl border border-purple-200 transform transition-transform duration-300 hover:scale-[1.005]"></div>

        <div className="mt-8 space-y-6">
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faLocationDot} className="text-blue-500 text-2xl" />
            <p className="text-gray-800 text-base">Address: 161 Cathedral Street, Glasgow G4 0RE, Scotland, UK</p>
          </div>
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faPhoneVolume} className="text-blue-500 text-2xl" />
            <p className="text-gray-800 text-base">Phone: +44 (0)141 548 2000</p>
          </div>
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500 text-2xl" />
            <p className="text-gray-800 text-base">Email: valerie.odon@strath.ac.uk</p>
          </div>
          <div className="flex items-center space-x-4">
            <FontAwesomeIcon icon={faPaperPlane} className="text-blue-500 text-2xl" />
            <p className="text-gray-800 text-base">Department: Strathclyde Institute of Pharmacy and Biomedical Sciences</p>
          </div>
        </div>
      </div>

      </div>
    </div>
  );


}

export default ContactPage;