import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Processing your resume..." 
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            Analyzing Resume
          </p>
          <p className="text-gray-500">{message}</p>
        </div>
        <div className="w-full max-w-md">
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-2 bg-gray-200 rounded-full flex-1"
              >
                <div 
                  className="h-full bg-blue-600 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};