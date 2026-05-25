import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react'
import Modal from '../../components/Modal'

export default function ResidentStatus() {
  const { requests } = useData()
  const [downloading, setDownloading] = useState(null)

  const myRequests = [...requests].sort((a,b) => b.id - a.id)

  const statusIcon = (s) => {
    if (s === 'approved') return <CheckCircle size={16} className="text-green-500"/>
    if (s === 'rejected') return <XCircle size={16} className="text-red-500"/>
    return <Clock size={16} className="text-amber-500"/>
  }

  const handleDownload = (req) => {
    setDownloading(req)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">My Request Status</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{myRequests.length} total requests</p>
      </div>

      {myRequests.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="mx-auto mb-3 text-gray-300 dark:text-gray-600" size={32}/>
          <p className="text-gray-500 dark:text-gray-400">No requests submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myRequests.map(r => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {statusIcon(r.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize text-sm">{r.type} Certificate</p>
                    <p className="text-xs text-gray-400">{r.purpose} · Submitted {r.submittedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge-${r.status}`}>{r.status}</span>
                  {r.status === 'approved' && (
                    <button onClick={() => handleDownload(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
                      <Download size={12}/> Download
                    </button>
                  )}
                </div>
              </div>
              {r.reviewNote && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-xs ${r.status==='rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                  <span className="font-medium">Note:</span> {r.reviewNote}
                </div>
              )}
              {r.reviewedAt && (
                <p className="text-xs text-gray-400 mt-2">Reviewed: {r.reviewedAt}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Download modal (UI only) */}
      <Modal open={!!downloading} onClose={() => setDownloading(null)} title="Download Certificate" size="sm">
        {downloading && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <Download className="text-green-600 dark:text-green-400" size={28}/>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white capitalize">{downloading.type} Certificate</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ready to download · PDF format</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Resident</span><span className="font-medium">{downloading.residentName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{downloading.type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Issued</span><span className="font-medium">{downloading.reviewedAt}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Purpose</span><span className="font-medium">{downloading.purpose}</span></div>
            </div>
            <button
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              onClick={() => {
                alert('In a live system, your certificate PDF would download here.')
                setDownloading(null)
              }}>
              <Download size={15}/> Download PDF
            </button>
            <button onClick={() => setDownloading(null)} className="btn-secondary w-full">Close</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
