import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CustomCard({ title, description, buttonText, route, image, icon, badge, gradient = false }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl cursor-pointer h-full flex flex-col justify-between ${
        gradient ? 'card-gradient' : 'card-modern'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        border: isHovered ? '1.5px solid rgba(34, 197, 94, 0.35)' : undefined,
      }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            badge === 'New' ? 'bg-farm-green-500 text-white' :
            badge === 'Popular' ? 'bg-yellow-500 text-white' :
            badge === 'Recommended' ? 'bg-blue-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {badge}
          </span>
        </div>
      )}

      {/* Light hover glow (behind content, very subtle) */}
      <div className={`absolute inset-0 bg-gradient-to-br from-farm-green-400/5 to-farm-green-600/5 transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Content flex wrapper */}
      <div className="flex flex-col flex-grow justify-between relative z-10 h-full">
        <div className="flex flex-col items-center flex-grow">
          {/* Image/Icon Section */}
          <div className="relative mb-4 flex justify-center">
            <div className={`relative transition-all duration-300 ${
              isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
            }`}>
              {image && (
                <img
                  src={image}
                  alt={title}
                  className="w-16 h-16 object-contain filter drop-shadow-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              {icon && (
                <div className="w-16 h-16 flex items-center justify-center text-4xl">
                  {icon}
                </div>
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 flex-grow flex flex-col justify-start">
            <h3 className="text-xl font-display font-semibold text-gray-800 group-hover:text-farm-green-700 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Button Section */}
        <div className="pt-4 mt-auto w-full">
          <button
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="btn-primary text-sm px-6 py-2 w-full group-hover:shadow-lg transition-all duration-300"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>{buttonText}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  isHovered ? 'translate-x-1' : 'translate-x-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomCard;
