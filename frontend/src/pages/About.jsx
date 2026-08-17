import React from "react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14">
      <h1 className="text-2xl font-semibold mb-6">About PlayNearby</h1>
      <p className="text-gray-600 leading-relaxed mb-4">
        PlayNearby is a community-based platform built to help people discover and connect
        with nearby partners for indoor and outdoor games — from chess and carrom to
        badminton, table tennis, cricket, football, and volleyball.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        We believe recreational play shouldn't depend on scattered WhatsApp groups or
        word-of-mouth. By making it simple to find someone nearby who shares your
        interests and availability, we hope to encourage more social interaction,
        healthy recreation, and stronger neighborhood engagement.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        {[
          { title: "Our Mission", desc: "Make finding a play partner as easy as searching a map." },
          { title: "Our Community", desc: "Homes, society clubhouses, and local grounds — all connected." },
          { title: "Our Vision", desc: "A more active, socially connected neighborhood, one game at a time." },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
