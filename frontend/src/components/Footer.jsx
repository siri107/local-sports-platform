import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-primary text-lg mb-2">PlayNearby</h3>
            <p className="text-sm text-gray-500">
              Find nearby partners for indoor and outdoor games. Play more, connect more.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-500">
              <li><Link to="/find-players" className="hover:text-primary">Find Players</Link></li>
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Games</h4>
            <p className="text-sm text-gray-500">
              Chess • Carrom • Badminton • Table Tennis • Cricket • Football • Volleyball
            </p>
          </div>
        </div>
        <div className="border-t mt-6 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} PlayNearby — Local Sports & Indoor Games Partner Finder Platform.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
