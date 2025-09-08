"use client";

import React, { useState, useEffect } from "react";

const images = [
  "https://images.pexels.com/photos/5905457/pexels-photo-5905457.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/5905445/pexels-photo-5905445.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/5905440/pexels-photo-5905440.jpeg?auto=compress&cs=tinysrgb&w=1920",
];

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto Slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <section className="w-full flex justify-center bg-gradient-to-r from-gray-100 to-gray-200 py-10">
      <div className="relative w-full md:w-[90%] lg:w-[80%] h-[280px] md:h-[380px] lg:h-[480px] overflow-hidden rounded-2xl shadow-xl grid place-items-center bg-white">
        
        {/* Image Slide */}
        <div
          key={currentIndex}
          className="w-full h-full transition-opacity duration-1000 ease-in-out"
        >
          <img
            src={images[currentIndex]}
            alt="Banner"
            className="w-full h-full object-cover animate-fade-slide"
          />
        </div>

    

        {/* Next Button */}
        

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BannerSlider;
