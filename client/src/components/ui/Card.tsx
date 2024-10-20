import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardImageProps {
  src: string;
  alt: string;
}

interface CardHeaderProps {
  children: ReactNode;
}

interface CardTitleProps {
  children: ReactNode;
}

interface CardDescriptionProps {
  children: ReactNode;
}

interface CardContentProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> & {
  Image: React.FC<CardImageProps>;
  Header: React.FC<CardHeaderProps>;
  Title: React.FC<CardTitleProps>;
  Description: React.FC<CardDescriptionProps>;
  Content: React.FC<CardContentProps>;
} = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

Card.Image = ({ src, alt }) => {
  return (
    <div className="w-full h-48 overflow-hidden">
      <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
    </div>
  );
};

Card.Header = ({ children }) => {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
};

Card.Title = ({ children }) => {
  return <h2 className="font-bold text-xl mb-2 text-gray-800">{children}</h2>;
};

Card.Description = ({ children }) => {
  return <p className="text-gray-600 text-sm">{children}</p>;
};

Card.Content = ({ children }) => {
  return <div className="px-6 py-4">{children}</div>;
};

export default Card;