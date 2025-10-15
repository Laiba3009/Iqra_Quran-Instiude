import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function HomeBanner() {
  const images = [
    'https://images.unsplash.com/photo-1501769214405-5e86c6d0a2c1?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&q=80&auto=format&fit=crop',
  ];

  const texts = [
    'Welcome to our site — Aapka swagat hai.',
    'Quality services | Fast delivery | Trusted support',
    'Custom designs — Banner, Logo, Social Posts',
    'Contact: +91 98765 43210 (replace with yours)',
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Auto slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Typewriter logic
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
      {/* Left: Image carousel */}
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
        <h1 className="text-3xl font-semibold mb-2 text-white">IQRA Online Quran Institude</h1>
        <p className="text-white/70 mb-4 text-base text-white">Chhota sa subheading ya description. Typewriter niche auto-rotate karega.</p>
        <div className="font-mono text-white text-lg min-h-[32px]">
          {currentText}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
}
