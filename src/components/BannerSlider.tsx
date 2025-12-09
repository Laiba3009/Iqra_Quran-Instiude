"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BannerSlider() {

  const images = [
    "/images/banner-1.png",
    "/images/banner-2.png",
    "/images/banner-3.png",
    "/images/banner-4.png",
  ];

  const texts = [
    'Learn Quran Online with Expert Teachers',
    'Interactive Classes for Kids and Adults',
    'Tajweed, Quran Recitation & Memorization',
    'Flexible Timings | Join from Anywhere',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Typewriter
  useEffect(() => {
    const current = texts[textIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (currentText.length < current.length) {
        timeout = setTimeout(() => {
          setCurrentText(current.slice(0, currentText.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 1200);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(current.slice(0, currentText.length - 1));
        }, 30);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(true);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isTyping, textIndex, texts]);

  return (
    <div className="w-full mt-6 flex flex-col md:flex-row rounded-none overflow-hidden bg-[#0f1724]">

      {/* Left: Slider */}
      <div className="relative w-full md:w-1/2 h-64 md:h-[500px]">
        {images.map((img, i) => (
          <motion.img
            key={i}
            src={img}
            alt={`Slide ${i + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: i === currentSlide ? 1 : 0 }}
            transition={{ duration: 0.8 }}
          />
        ))}

        {/* Dots */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                i === currentSlide ? 'bg-cyan-400 scale-110' : 'bg-white/40'
              }`}
              onClick={() => setCurrentSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* Right: Typewriter */}
      <div className="flex flex-col justify-center items-start p-6 md:p-8 w-full md:w-1/2 bg-[#0b1220]">
        <h1 className="text-3xl font-semibold mb-2 text-white">IQRA Online Quran Institute</h1>
        <p className="text-white/70 mb-4 text-base">
          Learn Quran Online from the comfort of your home. Classes available for all ages.
        </p>
        <div className="font-mono text-white text-lg min-h-[32px]">
          {currentText}
          <span className="animate-pulse">|</span>
        </div>
      </div>

    </div>
  );
}
