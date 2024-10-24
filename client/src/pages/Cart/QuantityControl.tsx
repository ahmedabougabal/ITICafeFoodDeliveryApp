import React, { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

const RippleButton = ({ children, onClick, disabled, className }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.offsetWidth, button.offsetHeight);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;

    const ripple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples([...ripples, ripple]);
    onClick?.(e);

    setTimeout(() => {
      setRipples(prevRipples => prevRipples.filter(r => r.id !== ripple.id));
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${className} relative overflow-hidden`}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x + 'px',
            top: ripple.y + 'px',
            width: ripple.size + 'px',
            height: ripple.size + 'px',
          }}
        />
      ))}
      {children}
    </button>
  );
};

const QuantityControl = ({ value, onChange, min, max }) => {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center bg-white rounded-lg shadow-lg">
      <RippleButton
        onClick={handleDecrease}
        disabled={value <= min}
        className="group relative w-12 h-12 flex items-center justify-center rounded-l-lg transition-all duration-300
                 bg-gradient-to-br from-pink-50 to-white
                 hover:from-pink-100 hover:to-pink-50
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50"
      >
        <MinusIcon
          size={18}
          className="text-gray-600 group-hover:text-pink-600 group-hover:scale-110 transition-all duration-300
                     group-disabled:text-gray-400"
        />
        <span className="absolute inset-0 rounded-l-lg border border-pink-100 group-hover:border-pink-200
                        transition-colors duration-300" />
      </RippleButton>

      <div className="relative px-2 h-12 min-w-[3rem] flex items-center justify-center border-y border-pink-100">
        <input
          type="text"
          value={value}
          readOnly
          className="w-full text-center text-gray-700 font-medium focus:outline-none bg-transparent"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-transparent pointer-events-none" />
      </div>

      <RippleButton
        onClick={handleIncrease}
        disabled={value >= max}
        className="group relative w-12 h-12 flex items-center justify-center rounded-r-lg transition-all duration-300
                 bg-gradient-to-br from-pink-50 to-white
                 hover:from-pink-100 hover:to-pink-50
                 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-opacity-50"
      >
        <PlusIcon
          size={18}
          className="text-gray-600 group-hover:text-pink-600 group-hover:scale-110 transition-all duration-300
                     group-disabled:text-gray-400"
        />
        <span className="absolute inset-0 rounded-r-lg border border-pink-100 group-hover:border-pink-200
                        transition-colors duration-300" />
      </RippleButton>
    </div>
  );
};

export default QuantityControl;