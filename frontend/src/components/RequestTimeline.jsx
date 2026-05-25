import { CheckCircle, Clock, FileText, XCircle, Download } from 'lucide-react';

const statusConfig = {
  pending: { step: 1, label: 'Submitted', color: 'amber', icon: FileText, description: 'Your request has been received and is awaiting review' },
  under_review: { step: 2, label: 'Under Review', color: 'blue', icon: Clock, description: 'A clerk is reviewing your documents and information' },
  approved: { step: 3, label: 'Approved', color: 'green', icon: CheckCircle, description: 'Your request has been approved' },
  issued: { step: 4, label: 'Certificate Issued', color: 'purple', icon: Download, description: 'Your certificate is ready for download' },
  rejected: { step: 3, label: 'Rejected', color: 'red', icon: XCircle, description: 'Your request was not approved' },
};

export default function RequestTimeline({ request }) {
  const config = statusConfig[request.status] || statusConfig.pending;
  const steps = [
    { key: 'pending', label: 'Submitted', icon: FileText },
    { key: 'under_review', label: 'Under Review', icon: Clock },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
    { key: 'issued', label: 'Issued', icon: Download },
  ];

  const currentStep = config.step;

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-sm mb-4">Request Progress</h3>

      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, idx) => {
            const isActive = idx + 1 <= currentStep;
            const isCurrent = idx + 1 === currentStep;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}`}>
                  <step.icon size={16} />
                </div>
                <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current status details */}
      <div className={`p-3 rounded-lg ${
        request.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' :
        request.status === 'approved' ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' :
        'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'
      }`}>
        <div className="flex items-center gap-2">
          <config.icon size={18} className={
            request.status === 'rejected' ? 'text-red-500' :
            request.status === 'approved' ? 'text-green-500' : 'text-blue-500'
          } />
          <div>
            <p className="text-sm font-medium">{config.label}</p>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
        {request.reviewNotes && (
          <p className="text-xs text-gray-500 mt-2 pl-6">Note: {request.reviewNotes}</p>
        )}
      </div>
    </div>
  );
}