import React from 'react';
import { Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  placeholder = "Paste the job description here..."
}) => {
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
        <div className="p-2 bg-green-100 rounded-lg">
          <Briefcase className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Job Description</h3>
          <p className="text-sm text-gray-500">
            {wordCount} words
          </p>
        </div>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-64 p-4 border-none resize-none focus:outline-none focus:ring-0 rounded-b-xl"
      />
    </div>
  );
};