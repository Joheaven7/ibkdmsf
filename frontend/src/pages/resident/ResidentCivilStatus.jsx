import { useState } from 'react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import { Heart, Scissors, CheckCircle, Clock, Download, Calendar, FileText, XCircle } from 'lucide-react'
import Modal from '../../components/Modal'

export default function ResidentCivilStatus() {
  const { user } = useAuth()
  const { marriages, addMarriage, divorces, addDivorce } = useData()
  const [tab, setTab] = useState('marriage')
  const [modalType, setModalType] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const [submittedType, setSubmittedType] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const minAppointmentDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Marriage request form
  const [mForm, setMForm] = useState({ 
    spouseName: '', 
    date: '', 
    kebele: user?.kebele || '03',
    preferredAppointmentDate: '',
    witnessName: '',
    witnessPhone: ''
  })
  // Divorce request form
  const [dForm, setDForm] = useState({ 
    spouseName: '', 
    date: '', 
    reason: '', 
    kebele: user?.kebele || '03',
    preferredAppointmentDate: ''
  })

  // Documents
  const [mDocuments, setMDocuments] = useState({
    applicantId: null,
    spouseId: null,
    singleStatusProof: null,
    witnessStatement: null
  })
  const [dDocuments, setDDocuments] = useState({
    marriageCertificate: null,
    courtDecision: null,
    applicantId: null
  })

  const [mErrors, setMErrors] = useState({})
  const [dErrors, setDErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const setM = k => e => { 
    setMForm(f => ({ ...f, [k]: e.target.value })); 
    setMErrors(e => ({ ...e, [k]: '' })) 
  }
  const setD = k => e => { 
    setDForm(f => ({ ...f, [k]: e.target.value })); 
    setDErrors(e => ({ ...e, [k]: '' })) 
  }

  const handleMFileSelect = (field, file) => {
    setMDocuments(prev => ({ ...prev, [field]: file }))
  }

  const handleDFileSelect = (field, file) => {
    setDDocuments(prev => ({ ...prev, [field]: file }))
  }

  const validateM = () => {
    const e = {}
    if (!mForm.spouseName.trim()) e.spouseName = 'Required'
    if (!mForm.date) e.date = 'Required'
    if (!mForm.preferredAppointmentDate) e.preferredAppointmentDate = 'Required'
    if (!mDocuments.applicantId) e.applicantId = 'Required'
    if (!mDocuments.spouseId) e.spouseId = 'Required'
    if (!mDocuments.singleStatusProof) e.singleStatusProof = 'Required'
    setMErrors(e); return Object.keys(e).length === 0
  }

  const validateD = () => {
    const e = {}
    if (!dForm.spouseName.trim()) e.spouseName = 'Required'
    if (!dForm.date) e.date = 'Required'
    if (!dForm.reason.trim()) e.reason = 'Required'
    if (!dForm.preferredAppointmentDate) e.preferredAppointmentDate = 'Required'
    if (!dDocuments.marriageCertificate) e.marriageCertificate = 'Required'
    if (!dDocuments.courtDecision) e.courtDecision = 'Required'
    if (!dDocuments.applicantId) e.applicantId = 'Required'
    setDErrors(e); return Object.keys(e).length === 0
  }

  const handleMarriageSubmit = async (e) => {
    e.preventDefault()
    if (!validateM()) return

    setLoading(true)
    
    addMarriage({
      applicantName: user?.name,
      spouseName: mForm.spouseName,
      date: mForm.date,
      kebele: mForm.kebele,
      witnessName: mForm.witnessName,
      witnessPhone: mForm.witnessPhone,
      registeredBy: user?.name,
      status: 'pending',
      submittedByResident: true,
      documents: {
        applicantId: mDocuments.applicantId?.name,
        spouseId: mDocuments.spouseId?.name,
        singleStatusProof: mDocuments.singleStatusProof?.name,
        witnessStatement: mDocuments.witnessStatement?.name || null
      },
      preferredAppointmentDate: mForm.preferredAppointmentDate,
      appointmentRequired: true
    })

    setTimeout(() => {
      setLoading(false)
      setModalType(null)
      setSubmittedType('marriage')
      // Reset forms
      setMForm({ spouseName: '', date: '', kebele: user?.kebele || '03', preferredAppointmentDate: '', witnessName: '', witnessPhone: '' })
      setMDocuments({ applicantId: null, spouseId: null, singleStatusProof: null, witnessStatement: null })
    }, 800)
  }

  const handleDivorceSubmit = async (e) => {
    e.preventDefault()
    if (!validateD()) return

    setLoading(true)
    
    addDivorce({
      applicantName: user?.name,
      partnerName: dForm.spouseName,
      date: dForm.date,
      reason: dForm.reason,
      kebele: dForm.kebele,
      registeredBy: user?.name,
      status: 'pending',
      submittedByResident: true,
      documents: {
        marriageCertificate: dDocuments.marriageCertificate?.name,
        courtDecision: dDocuments.courtDecision?.name,
        applicantId: dDocuments.applicantId?.name
      },
      preferredAppointmentDate: dForm.preferredAppointmentDate,
      appointmentRequired: true
    })

    setTimeout(() => {
      setLoading(false)
      setModalType(null)
      setSubmittedType('divorce')
      // Reset forms
      setDForm({ spouseName: '', date: '', reason: '', kebele: user?.kebele || '03', preferredAppointmentDate: '' })
      setDDocuments({ marriageCertificate: null, courtDecision: null, applicantId: null })
    }, 800)
  }

  const statusIcon = (s) => {
    if (s === 'approved') return <CheckCircle size={16} className="text-green-500" />
    if (s === 'rejected') return <XCircle size={16} className="text-red-500" />
    return <Clock size={16} className="text-amber-500" />
  }

  const myMarriages = marriages.filter(m =>
    m.applicantName === user?.name || m.spouseName === user?.name
  )
  const myDivorces = divorces.filter(d =>
    d.applicantName === user?.name || d.partnerName === user?.name
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Civil Status Certificates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Request marriage or divorce certificates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalType('marriage')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-pink-600 hover:bg-pink-700 text-white transition-all active:scale-95">
            <Heart size={14} /> Request Marriage Cert.
          </button>
          <button onClick={() => setModalType('divorce')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white transition-all active:scale-95">
            <Scissors size={14} /> Request Divorce Cert.
          </button>
        </div>
      </div>

      {/* Success */}
      {submittedType && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <CheckCircle className={`mx-auto mb-6 ${submittedType === 'marriage' ? 'text-pink-600' : 'text-amber-600'}`} size={72} />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {submittedType === 'marriage' ? 'Marriage Certificate' : 'Divorce Certificate'} Request Submitted!
            </h2>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-4">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Partner:</span> 
                  <span className="font-bold text-gray-900">
                    {submittedType === 'marriage' ? mForm.spouseName : dForm.spouseName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span> 
                  <span className="font-bold text-gray-900">
                    {submittedType === 'marriage' ? mForm.date : dForm.date}
                  </span>
                </div>
                {submittedType === 'divorce' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span> 
                    <span className="font-medium">{dForm.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`border ${submittedType === 'marriage' ? 'border-pink-200 bg-pink-50' : 'border-amber-200 bg-amber-50'} rounded-2xl p-6 mb-6`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Calendar className={`${submittedType === 'marriage' ? 'text-pink-600' : 'text-amber-600'}`} size={28} />
                <h3 className={`font-semibold ${submittedType === 'marriage' ? 'text-pink-800' : 'text-amber-800'}`}>
                  In-Person Verification Appointment
                </h3>
              </div>
              <p className={`font-medium ${submittedType === 'marriage' ? 'text-pink-700' : 'text-amber-700'}`}>
                Date: <strong>
                  {new Date(submittedType === 'marriage' ? mForm.preferredAppointmentDate : dForm.preferredAppointmentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </strong>
              </p>
              <p className={`text-sm mt-3 ${submittedType === 'marriage' ? 'text-pink-600' : 'text-amber-600'}`}>
                Please bring all original documents on this date.
              </p>
            </div>

            <button 
              onClick={() => setSubmittedType(null)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all active:scale-95"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!submittedType && (
        <>
          <div className="flex gap-2">
            {[
              { key: 'marriage', label: `My Marriages (${myMarriages.length})`, icon: Heart },
              { key: 'divorce',  label: `My Divorces (${myDivorces.length})`,   icon: Scissors },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${tab === key
                    ? key === 'marriage' ? 'bg-pink-700 text-white border-pink-700' : 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Records */}
          {tab === 'marriage' ? (
            <div className="space-y-3">
              {myMarriages.length === 0 ? (
                <div className="card p-10 text-center">
                  <Heart className="mx-auto mb-2 text-pink-300 dark:text-pink-700" size={28} />
                  <p className="text-sm text-gray-400">No marriage certificates on record.</p>
                  <button onClick={() => setModalType('marriage')} className="mt-3 text-xs text-pink-600 dark:text-pink-400 hover:underline">Request one →</button>
                </div>
              ) : myMarriages.map(m => (
                <div key={m.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {statusIcon(m.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Marriage Certificate</p>
                        <p className="text-xs text-gray-400">{m.applicantName} & {m.spouseName} · {m.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-${m.status === 'approved' ? 'approved' : m.status === 'rejected' ? 'rejected' : 'pending'}`}>{m.status}</span>
                      {m.status === 'approved' && (
                        <button onClick={() => setDownloading({ ...m, certType: 'Marriage' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 hover:bg-pink-100 transition-colors">
                          <Download size={12} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                  {m.note && (
                    <p className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${m.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                      Note: {m.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {myDivorces.length === 0 ? (
                <div className="card p-10 text-center">
                  <Scissors className="mx-auto mb-2 text-amber-300 dark:text-amber-700" size={28} />
                  <p className="text-sm text-gray-400">No divorce certificates on record.</p>
                </div>
              ) : myDivorces.map(d => (
                <div key={d.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {statusIcon(d.status)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Divorce Certificate</p>
                        <p className="text-xs text-gray-400">{d.applicantName} & {d.partnerName} · {d.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge-${d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : 'pending'}`}>{d.status}</span>
                      {d.status === 'approved' && (
                        <button onClick={() => setDownloading({ ...d, certType: 'Divorce' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors">
                          <Download size={12} /> Download
                        </button>
                      )}
                    </div>
                  </div>
                  {d.note && (
                    <p className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${d.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}`}>
                      Note: {d.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Marriage Request Modal */}
      <Modal open={modalType === 'marriage'} onClose={() => setModalType(null)} title="Request Marriage Certificate" size="lg">
        <form onSubmit={handleMarriageSubmit} className="space-y-6">
          <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/40 rounded-xl p-4 text-sm text-pink-800 dark:text-pink-300">
            <strong>Process:</strong> Submit → Appointment → Verification → Registration → Certificate
          </div>

          <div>
            <label className="label">Your Name</label>
            <input className="input-field bg-gray-50 dark:bg-gray-800" value={user?.name} disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Spouse's Full Name <span className="text-red-500">*</span></label>
              <input className={`input-field ${mErrors.spouseName ? 'border-red-400 dark:border-red-600' : ''}`}
                value={mForm.spouseName} onChange={setM('spouseName')} placeholder="Spouse's full name" />
              {mErrors.spouseName && <p className="text-xs text-red-500 mt-1">{mErrors.spouseName}</p>}
            </div>
            <div>
              <label className="label">Date of Marriage <span className="text-red-500">*</span></label>
              <input className={`input-field ${mErrors.date ? 'border-red-400 dark:border-red-600' : ''}`}
                type="date" value={mForm.date} onChange={setM('date')} max={today} />
              {mErrors.date && <p className="text-xs text-red-500 mt-1">{mErrors.date}</p>}
              <p className="text-xs text-gray-500 mt-1">Marriage date cannot be in the future</p>
            </div>
          </div>

          <div>
            <label className="label">Witness Information</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field" value={mForm.witnessName} onChange={setM('witnessName')} placeholder="Witness full name" />
              <input className="input-field" value={mForm.witnessPhone} onChange={setM('witnessPhone')} placeholder="Witness phone" />
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <label className="label font-semibold">Required Documents <span className="text-red-500">(Originals required at appointment)</span></label>
            <div className="space-y-4">
              <div>
                <label className="label">Your ID Card <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleMFileSelect('applicantId', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                {mErrors.applicantId && <p className="text-xs text-red-500 mt-1">{mErrors.applicantId}</p>}
              </div>
              <div>
                <label className="label">Spouse's ID Card <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleMFileSelect('spouseId', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                {mErrors.spouseId && <p className="text-xs text-red-500 mt-1">{mErrors.spouseId}</p>}
              </div>
              <div>
                <label className="label">Proof of Single Status <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleMFileSelect('singleStatusProof', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-600 file:text-white hover:file:bg-pink-700" />
                {mErrors.singleStatusProof && <p className="text-xs text-red-500 mt-1">{mErrors.singleStatusProof}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Preferred Appointment Date <span className="text-red-500">*</span></label>
            <input className={`input-field ${mErrors.preferredAppointmentDate ? 'border-red-400 dark:border-red-600' : ''}`}
              type="date" value={mForm.preferredAppointmentDate} onChange={setM('preferredAppointmentDate')}
              min={minAppointmentDate} />
            {mErrors.preferredAppointmentDate && <p className="text-xs text-red-500 mt-1">{mErrors.preferredAppointmentDate}</p>}
            <p className="text-xs text-gray-500 mt-1">Earliest available: {minAppointmentDate} (2 days minimum notice)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} 
              className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg text-sm transition-all active:scale-95 disabled:opacity-70">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setModalType(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Divorce Request Modal */}
      <Modal open={modalType === 'divorce'} onClose={() => setModalType(null)} title="Request Divorce Certificate" size="lg">
        <form onSubmit={handleDivorceSubmit} className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Process:</strong> Submit → Appointment → Court Decision Verification → Certificate
          </div>

          <div>
            <label className="label">Your Name</label>
            <input className="input-field bg-gray-50 dark:bg-gray-800" value={user?.name} disabled />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Former Spouse's Full Name <span className="text-red-500">*</span></label>
              <input className={`input-field ${dErrors.spouseName ? 'border-red-400 dark:border-red-600' : ''}`}
                value={dForm.spouseName} onChange={setD('spouseName')} placeholder="Former spouse's full name" />
              {dErrors.spouseName && <p className="text-xs text-red-500 mt-1">{dErrors.spouseName}</p>}
            </div>
            <div>
              <label className="label">Date of Divorce <span className="text-red-500">*</span></label>
              <input className={`input-field ${dErrors.date ? 'border-red-400 dark:border-red-600' : ''}`}
                type="date" value={dForm.date} onChange={setD('date')} max={today} />
              {dErrors.date && <p className="text-xs text-red-500 mt-1">{dErrors.date}</p>}
              <p className="text-xs text-gray-500 mt-1">Divorce date cannot be in the future</p>
            </div>
          </div>

          <div>
            <label className="label">Reason of Divorce <span className="text-red-500">*</span></label>
            <input className={`input-field ${dErrors.reason ? 'border-red-400 dark:border-red-600' : ''}`}
              value={dForm.reason} onChange={setD('reason')} placeholder="e.g. Irreconcilable differences, Court order" />
            {dErrors.reason && <p className="text-xs text-red-500 mt-1">{dErrors.reason}</p>}
          </div>

          {/* Required Documents */}
          <div>
            <label className="label font-semibold">Required Documents <span className="text-red-500">(Originals required at appointment)</span></label>
            <div className="space-y-4">
              <div>
                <label className="label">Original Marriage Certificate <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleDFileSelect('marriageCertificate', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700" />
                {dErrors.marriageCertificate && <p className="text-xs text-red-500 mt-1">{dErrors.marriageCertificate}</p>}
              </div>
              <div>
                <label className="label">Court Decision / Legal Divorce Agreement <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleDFileSelect('courtDecision', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700" />
                {dErrors.courtDecision && <p className="text-xs text-red-500 mt-1">{dErrors.courtDecision}</p>}
              </div>
              <div>
                <label className="label">Your ID Card <span className="text-red-500">*</span></label>
                <input type="file" onChange={(e) => handleDFileSelect('applicantId', e.target.files[0])} 
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700" />
                {dErrors.applicantId && <p className="text-xs text-red-500 mt-1">{dErrors.applicantId}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Preferred Appointment Date <span className="text-red-500">*</span></label>
            <input className={`input-field ${dErrors.preferredAppointmentDate ? 'border-red-400 dark:border-red-600' : ''}`}
              type="date" value={dForm.preferredAppointmentDate} onChange={setD('preferredAppointmentDate')}
              min={minAppointmentDate} />
            {dErrors.preferredAppointmentDate && <p className="text-xs text-red-500 mt-1">{dErrors.preferredAppointmentDate}</p>}
            <p className="text-xs text-gray-500 mt-1">Earliest available: {minAppointmentDate} (2 days minimum notice)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} 
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-all active:scale-95 disabled:opacity-70">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setModalType(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Download Modal */}
      <Modal open={!!downloading} onClose={() => setDownloading(null)} title="Download Certificate" size="sm">
        {downloading && (
          <div className="space-y-4 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${downloading.certType === 'Marriage' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              {downloading.certType === 'Marriage'
                ? <Heart className="text-pink-600 dark:text-pink-400" size={26} />
                : <Scissors className="text-amber-600 dark:text-amber-400" size={26} />}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{downloading.certType} Certificate</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Approved · PDF format</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left text-sm space-y-1.5">
              {downloading.certType === 'Marriage' ? (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Applicant</span><span className="font-medium">{downloading.applicantName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Spouse</span><span className="font-medium">{downloading.spouseName}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-gray-500">Applicant</span><span className="font-medium">{downloading.applicantName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Partner</span><span className="font-medium">{downloading.partnerName}</span></div>
                </>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{downloading.date}</span></div>
            </div>
            <button onClick={() => { alert('In a live system, the certificate PDF would download here.'); setDownloading(null) }}
              className={`w-full py-2.5 font-medium rounded-lg text-sm text-white transition-all flex items-center justify-center gap-2 active:scale-95 ${downloading.certType === 'Marriage' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
              <Download size={15} /> Download PDF
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}