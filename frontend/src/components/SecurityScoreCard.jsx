import { Shield, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

export default function SecurityScoreCard({ metrics }) {
  const calculateScore = () => {
    let score = 100;
    if (metrics.failedLogins > 10) score -= 20;
    if (metrics.failedLogins > 5) score -= 10;
    if (metrics.passwordResets > 20) score -= 10;
    if (metrics.suspiciousActivity > 0) score -= 25;
    if (metrics.inactiveUsers > 10) score -= 10;
    if (metrics.inactiveUsers > 5) score -= 5;
    return Math.max(0, score);
  };

  const score = calculateScore();
  const getGrade = () => {
    if (score >= 90) return { grade: 'A', color: 'green', text: 'Excellent' };
    if (score >= 80) return { grade: 'B', color: 'blue', text: 'Good' };
    if (score >= 70) return { grade: 'C', color: 'amber', text: 'Fair' };
    if (score >= 60) return { grade: 'D', color: 'orange', text: 'Poor' };
    return { grade: 'F', color: 'red', text: 'Critical' };
  };

  const { grade, color, text } = getGrade();
  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield size={18} className="text-primary-600" /> Security Score
        </h3>
        <span className={`text-2xl font-bold px-3 py-1 rounded-lg border ${colorClasses[color]}`}>
          {grade}
        </span>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
            <circle 
              cx="64" 
              cy="64" 
              r="56" 
              stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12" 
              fill="none"
              strokeDasharray={`${score * 3.52} 352`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{score}</span>
            <span className="text-xs text-gray-500">/100</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mb-4">{text}</p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <Lock size={14} /> Failed Logins
          </span>
          <span className={metrics.failedLogins > 10 ? 'text-red-600 font-bold' : 'text-gray-500'}>
            {metrics.failedLogins}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <AlertTriangle size={14} /> Suspicious Activity
          </span>
          <span className={metrics.suspiciousActivity > 0 ? 'text-red-600 font-bold' : 'text-gray-500'}>
            {metrics.suspiciousActivity}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-600">
            <CheckCircle size={14} /> Inactive Users
          </span>
          <span className="text-gray-500">{metrics.inactiveUsers}</span>
        </div>
      </div>
    </div>
  );
}