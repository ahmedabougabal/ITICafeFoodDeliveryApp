import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  const [gradientAngle, setGradientAngle] = useState(135);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGradientAngle((prevAngle) => (prevAngle + 1) % 360);
    }, 50);

    return () => clearInterval(intervalId);
  }, []);

  const footerStyle = {
    background: `linear-gradient(${gradientAngle}deg, #f11d71 0%, #85122c 100%)`,
  };

  return (
    <footer className="text-white relative" style={footerStyle}>
      {/* Wave decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="fill-white"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-12 gap-8">
          {/* Brand Section */}
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-3xl font-bold text-white mb-6">ITIFoods</h2>
            <p className="text-gray-200 mb-8 text-lg">
              Bringing delicious moments to the people we develop and saving their precious times.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                <FaFacebookF size={24} color="#1877F2" />
              </a>
              <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                <FaTwitter size={24} color="#1DA1F2" />
              </a>
              <a href="#" className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                <FaInstagram size={24} color="#E1306C" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-12 lg:col-span-3">
            <h3 className="text-xl font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
            </h3>
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-gray-200 hover:text-white transition-colors text-lg">Home</a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors text-lg">Menu</a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors text-lg">About Us</a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors text-lg">Contact</a>
              <a href="#" className="text-gray-200 hover:text-white transition-colors text-lg">FAQ</a>
            </nav>
          </div>

          {/* Contact Section */}
          <div className="col-span-12 lg:col-span-5">
            <h3 className="text-xl font-semibold mb-6 relative inline-block">
              Contact Us
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white"></span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <MapPin className="text-white" size={24} />
                <span className="text-gray-200 text-lg">ITI NewCapital Branch</span>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="text-white" size={24} />
                <span className="text-gray-200 text-lg">+20 01144520163</span>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="text-white" size={24} />
                <span className="text-gray-200 text-lg">Sat - Thurs: 8:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white border-opacity-20">
          <div className="flex justify-center items-center">
            <div className="text-gray-200 text-lg">
              © 2024 ITIFoods. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };