import { useState, useMemo }    from 'react';
import { useData }              from '../../context/DataContext';
import { useNavigate }          from 'react-router-dom';
import Table                    from '../../components/Table';
import Modal                    from '../../components/Modal';
import { CheckCircle, XCircle, Eye, Calendar, FileText, ExternalLink } from 'lucide-react';
import toast                    from 'react-hot-toast';

export default function ClerkRequests() {
  const { requests, updateRequestStatus } = useData();
  const navigate = useNavigate();

  const [selected, setSelected]         = useState(null);
  const [action, setAction]             = useState('');
  const [note, setNote]                 = useState('');
  const [filter, setFilter]             = useState('pending');
  const [viewingRequest, setViewingRequest] = useState(null);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const groupedRequests = useMemo(() => {
    const groups = {};
    filtered.forEach(req => {
      const dateKey = req.preferredAppointmentDate
        ? new Date(req.preferredAppointmentDate).toISOString().split('T')[0]
        : 'no-date';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(req);
    });
    return Object.keys(groups)
      .sort((a, b) => new Date(a) - new Date(b))
      .reduce((acc, key) => { acc[key] = groups[key]; return acc; }, {});
  }, [filtered]);

  const openAction = (req, act) => { setSelected(req); setAction(act); setNote(''); };

  const handleConfirm = () => {
    if (!selected) return;
    updateRequestStatus(selected.id, action, note);

    if (action === 'approved') {
      toast.success('Request approved! Redirecting to certificate…');
      // FIX #14 — use navigate() instead of window.location.href + setTimeout
      navigate(`/clerk/create-certificate/${selected.id}`);
    } else {
      toast.error('Request rejected.');
    }
    setSelected(null);
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
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Process Requests</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Review and action certificate requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === s
                ? 'bg-primary-800 dark:bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {s} ({s === 'all' ? requests.length : requests.filter(r => r.status === s).length})
          </button>
        ))}
      </div>

      {/* Grouped by appointment date */}
      {Object.keys(groupedRequests).length === 0 ? (
        <div className="card p-12 text-center text-gray-400 dark:text-gray-500">No requests found.</div>
      ) : Object.entries(groupedRequests).map(([dateKey, records]) => {
        const displayDate = dateKey === 'no-date'
          ? 'No Appointment Date'
          : new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

        return (
          <div key={dateKey}>
            <div className="flex items-center gap-3 mb-3">
              <Calendar size={18} className="text-primary-600" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{displayDate}</h3>
              <span className="badge-pending">{records.length} request{records.length !== 1 ? 's' : ''}</span>
            </div>

            <Table
              columns={columns}
              data={records}
              actions={row => (
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => setViewingRequest(row)}
                    className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Eye size={15} />
                  </button>
                  {row.status === 'pending' && (
                    <>
                      <button onClick={() => openAction(row, 'approved')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => openAction(row, 'rejected')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        );
      })}

      {/* Details modal */}
      <Modal open={!!viewingRequest} onClose={() => setViewingRequest(null)} title="Request Details" size="lg">
        {viewingRequest && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="label">Resident</p><p className="font-medium">{viewingRequest.residentName}</p></div>
              <div><p className="label">Type</p><p className="font-medium capitalize">{viewingRequest.type}</p></div>
              <div><p className="label">Purpose</p><p className="font-medium">{viewingRequest.purpose || '—'}</p></div>
              <div><p className="label">Status</p><span className={`badge-${viewingRequest.status}`}>{viewingRequest.status}</span></div>
              <div><p className="label">Submitted</p><p className="font-medium">{viewingRequest.submittedAt}</p></div>
              {viewingRequest.preferredAppointmentDate && (
                <div><p className="label">Appointment</p><p className="font-medium">{viewingRequest.preferredAppointmentDate}</p></div>
              )}
            </div>
            {viewingRequest.additionalInfo && (
              <div>
                <p className="label">Additional Info</p>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">{viewingRequest.additionalInfo}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve / Reject modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${action === 'approved' ? 'Approve' : 'Reject'} Request`} size="sm">
        {selected && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg text-sm ${action === 'approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
              <strong>{action === 'approved' ? 'Approving' : 'Rejecting'}</strong> request #{selected.id} — {selected.residentName}
            </div>
            <div>
              <label className="label">Review Note (optional)</label>
              <textarea className="input-field" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirm} className={`flex-1 py-2.5 font-medium text-sm rounded-lg text-white ${action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Confirm {action === 'approved' ? 'Approval' : 'Rejection'}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}