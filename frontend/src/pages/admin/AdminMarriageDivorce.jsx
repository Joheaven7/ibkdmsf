import { useState } from 'react'
import { useData } from '../../context/DataContext'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import { Heart, Scissors, CheckCircle, XCircle } from 'lucide-react'

export default function AdminMarriageDivorce() {
  const { marriages, updateMarriageStatus, divorces, updateDivorceStatus } = useData()
  const [tab, setTab] = useState('marriage')
  const [selected, setSelected] = useState(null)
  const [recordType, setRecordType] = useState(null) // 'marriage' | 'divorce'
  const [action, setAction] = useState('')
  const [note, setNote] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const openAction = (record, type, act) => {
    setSelected(record); setRecordType(type); setAction(act); setNote('')
  }

  const handleConfirm = () => {
    if (recordType === 'marriage') updateMarriageStatus(selected.id, action, note)
    else updateDivorceStatus(selected.id, action, note)
    setSelected(null)
  }

  const filtered = (data) => filterStatus === 'all' ? data : data.filter(r => r.status === filterStatus)

  const ActionBtns = ({ row, type }) => row.status !== 'pending' ? null : (
    <div className="flex items-center gap-1.5 justify-end">
      <button onClick={() => openAction(row, type, 'approved')}
        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 transition-colors">
        <CheckCircle size={12} /> Approve
      </button>
      <button onClick={() => openAction(row, type, 'rejected')}
        className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 transition-colors">
        <XCircle size={12} /> Reject
      </button>
    </div>
  )

  const mCols = [
    { key: 'id', label: 'No.', render: v => `#${v}` },
    { key: 'husbandName', label: 'Husband' },
    { key: 'wifeName', label: 'Wife' },
    { key: 'date', label: 'Date' },
    { key: 'witnessName', label: 'Witness' },
    { key: 'registeredBy', label: 'Registered By' },
    { key: 'status', label: 'Status', render: v => <span className={`badge-${v === 'approved' ? 'approved' : v === 'rejected' ? 'rejected' : 'pending'}`}>{v}</span> },
  ]
  const dCols = [
    { key: 'id', label: 'No.', render: v => `#${v}` },
    { key: 'partner1', label: 'Partner 1' },
    { key: 'partner2', label: 'Partner 2' },
    { key: 'date', label: 'Date' },
    { key: 'reason', label: 'Reason', render: v => v || '—' },
    { key: 'registeredBy', label: 'Registered By' },
    { key: 'status', label: 'Status', render: v => <span className={`badge-${v === 'approved' ? 'approved' : v === 'rejected' ? 'rejected' : 'pending'}`}>{v}</span> },
  ]

  const pendingM = marriages.filter(m => m.status === 'pending').length
  const pendingD = divorces.filter(d => d.status === 'pending').length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Marriage & Divorce Records</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {pendingM + pendingD} pending approval{pendingM + pendingD !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Marriages',  value: marriages.length,                                color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400' },
          { label: 'Pending Marriage', value: pendingM,                                        color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
          { label: 'Total Divorces',   value: divorces.length,                                 color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
          { label: 'Pending Divorce',  value: pendingD,                                        color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className={`text-2xl font-bold font-display ${color.split(' ').slice(2).join(' ')}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('marriage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${tab === 'marriage' ? 'bg-pink-700 text-white border-pink-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
            <Heart size={14} /> Marriages
          </button>
          <button onClick={() => setTab('divorce')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${tab === 'divorce' ? 'bg-amber-700 text-white border-amber-700' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
            <Scissors size={14} /> Divorces
          </button>
        </div>
        <div className="flex gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${
                filterStatus === s
                  ? 'bg-primary-800 dark:bg-primary-600 text-white border-primary-800'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {tab === 'marriage' ? (
        <Table columns={mCols} data={filtered(marriages)} searchKeys={['husbandName', 'wifeName']}
          actions={row => <ActionBtns row={row} type="marriage" />} />
      ) : (
        <Table columns={dCols} data={filtered(divorces)} searchKeys={['partner1', 'partner2']}
          actions={row => <ActionBtns row={row} type="divorce" />} />
      )}

      {/* Confirm Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${action === 'approved' ? 'Approve' : 'Reject'} ${recordType === 'marriage' ? 'Marriage' : 'Divorce'} Record`} size="sm">
        {selected && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg text-sm ${action === 'approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'}`}>
              {action === 'approved' ? 'Approving' : 'Rejecting'} the {recordType} record for{' '}
              <strong>{recordType === 'marriage' ? `${selected.husbandName} & ${selected.wifeName}` : `${selected.partner1} & ${selected.partner2}`}</strong>
            </div>
            <div>
              <label className="label">Review Note (optional)</label>
              <textarea className="input-field" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirm}
                className={`flex-1 py-2.5 font-medium rounded-lg text-sm text-white transition-all active:scale-95 ${action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Confirm {action === 'approved' ? 'Approval' : 'Rejection'}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
