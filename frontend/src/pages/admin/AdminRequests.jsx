import { useState }    from 'react';
import { useData }     from '../../context/DataContext';
import Table           from '../../components/Table';
import Modal           from '../../components/Modal';
import { Eye }         from 'lucide-react';
import toast           from 'react-hot-toast';

export default function AdminRequests() {
  const { requests, updateRequestStatus } = useData();

  const [filter, setFilter]           = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction]           = useState('');
  const [reviewNote, setReviewNote]   = useState('');

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const openReview = (request, act) => { setSelectedRequest(request); setAction(act); setReviewNote(''); };

  const confirmAction = () => {
    if (!selectedRequest) return;
    updateRequestStatus(selectedRequest.id, action, reviewNote || (action === 'approved' ? 'Approved by admin' : 'Rejected by admin'));
    // FIX #8 — toast instead of alert()
    action === 'approved' ? toast.success('Request approved successfully!') : toast.error('Request rejected.');
    setSelectedRequest(null);
  };

  const columns = [
    { key: 'id',           label: 'Req. No.',  render: v => `#${v}` },
    { key: 'residentName', label: 'Resident' },
    { key: 'type',         label: 'Type',      render: v => <span className="capitalize">{v}</span> },
    { key: 'purpose',      label: 'Purpose' },
    { key: 'submittedAt',  label: 'Submitted' },
    { key: 'status',       label: 'Status',    render: v => <span className={`badge-${v}`}>{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Certificate Requests</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage all certificate requests</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === s
                ? 'bg-primary-800 dark:bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
            }`}>
            {s === 'all' ? 'All' : s} ({s === 'all' ? requests.length : requests.filter(r => r.status === s).length})
          </button>
        ))}
      </div>

      <Table
        columns={columns}
        data={filteredRequests}
        searchKeys={['residentName', 'type', 'purpose']}
        actions={row => (
          <div className="flex items-center gap-1.5 justify-end">
            <button onClick={() => { setSelectedRequest(row); setAction(''); }}
              className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <Eye size={14} />
            </button>
            {row.status === 'pending' && (
              <>
                <button onClick={() => openReview(row, 'approved')}
                  className="px-2.5 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded hover:bg-green-100 transition-colors">
                  Approve
                </button>
                <button onClick={() => openReview(row, 'rejected')}
                  className="px-2.5 py-1 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-100 transition-colors">
                  Reject
                </button>
              </>
            )}
          </div>
        )}
      />

      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}
        title={action ? `${action === 'approved' ? 'Approve' : 'Reject'} Request` : 'Request Details'} size="md">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-sm">
              <p className="font-semibold">{selectedRequest.residentName}</p>
              <p className="text-gray-500 mt-0.5">Type: <span className="capitalize">{selectedRequest.type}</span> · Purpose: {selectedRequest.purpose}</p>
              <p className="text-gray-500">Submitted: {selectedRequest.submittedAt}</p>
            </div>
            {action && (
              <div>
                <label className="label">Review Note</label>
                <textarea className="input-field h-24" placeholder="Write a note for the resident…" value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelectedRequest(null)} className="flex-1 btn-secondary">Cancel</button>
              {action && (
                <button onClick={confirmAction}
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium ${action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirm {action === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}