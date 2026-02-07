import React from 'react';
import { MatchResult } from '../types';
import { CheckCircle, XCircle, Target, TrendingUp } from 'lucide-react';

interface MatchResultsProps {
  result: MatchResult;
}

export const MatchResults: React.FC<MatchResultsProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Match Analysis</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(result.matchScore)}`}>
            {getScoreText(result.matchScore)}
          </div>
        </div>
        
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className={`${result.matchScore >= 80 ? 'text-green-500' : 
                  result.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 56 * (result.matchScore / 100)} ${2 * Math.PI * 56}`}
                style={{
                  transition: 'stroke-dasharray 1s ease-out'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{result.matchScore}%</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{result.matchedSkills.length}</div>
            <div className="text-sm text-gray-500">Matched Skills</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{result.missingSkills.length}</div>
            <div className="text-sm text-gray-500">Missing Skills</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{result.totalSkills}</div>
            <div className="text-sm text-gray-500">Total JD Skills</div>
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      {result.matchedSkills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Matched Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {result.missingSkills.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium text-gray-900">Skills to Improve</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              💡 <strong>Tip:</strong> Consider adding these skills to your resume or gaining experience in these areas to improve your match score for this role.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};