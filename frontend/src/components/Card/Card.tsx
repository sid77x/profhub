import React from 'react';

interface CardProps {
  title: string;
  value: number | string;
  bgColor?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, bgColor = 'bg-white', icon }) => {
  return (
    <div className={`${bgColor} overflow-hidden shadow rounded-lg`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && <div className="text-gray-400">{icon}</div>}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
