import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate }       from 'react-router-dom';
import { useData }                      from '../../context/DataContext';
import { useAuth }                      from '../../context/AuthContext';
import { Download, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import CertificateSignatureBlock from '../../components/CertificateSignatureBlock';
import api                              from '../../lib/api';
import toast                            from 'react-hot-toast';

const VERIFY_BASE = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export default function CreateCertificate() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { requests } = useData();
  const { user }    = useAuth();
  const certRef     = useRef(null);

  const [request,  setRequest]  = useState(null);
  const [cert,     setCert]     = useState(null);   // stored certificate from DB
  const [loading,  setLoading]  = useState(false);
  const [issuing,  setIssuing]  = useState(false);

  // FIX #17 — use _id not id
  useEffect(() => {
    const found = requests.find(r => r._id === id || String(r._id) === String(id));
    setRequest(found ?? null);
  }, [id, requests]);

  // Issue certificate on mount (idempotent — backend checks if already issued)
  useEffect(() => {
    if (!request) return;
    setIssuing(true);
    api.post('/certificates', {
      requestId:    request._id,
      type:         request.type,
      residentId:   request.residentId?._id ?? request.residentId,
      residentName: request.residentName,
      kebele:       request.residentId?.kebele ?? '03',
      data: {
        childName:    request.childName,
        dateOfBirth:  request.dateOfBirth,
        placeOfBirth: request.placeOfBirth,
        childGender:  request.childGender,
        deceasedName: request.deceasedName,
        dateOfDeath:  request.dateOfDeath,
        placeOfDeath: request.placeOfDeath,
        causeOfDeath: request.causeOfDeath,
        fatherName:   request.residentId?.fatherName,
        motherName:   request.residentId?.motherName,
      },
    })
      .then(res => { setCert(res.data); })
      .catch(err => toast.error('Failed to issue certificate: ' + err.message))
      .finally(() => setIssuing(false));
  }, [request]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin:      [10, 10, 10, 10],
          filename:    `${cert?.certificateNumber ?? 'certificate'}.pdf`,
          image:       { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(certRef.current)
        .save();
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Request not found.</p>
        <button onClick={() => navigate('/clerk/requests')} className="btn-secondary flex items-center gap-2 mx-auto">
          <ArrowLeft size={15} /> Back to Requests
        </button>
      </div>
    );
  }

  const issueDate  = cert?.issuedAt ? new Date(cert.issuedAt) : new Date();
  const certNumber = cert?.certificateNumber ?? '…';
  const verifyURL  = `${VERIFY_BASE}/verify/${certNumber}`;

  const typeLabel = {
    birth:     'BIRTH',
    death:     'DEATH',
    residency: 'RESIDENCY',
  }[request.type] ?? request.type?.toUpperCase();

  return (
    <div id="certificate-print-root">
    <div ref={certRef} className="min-h-screen bg-gray-200 dark:bg-gray-900 py-10 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-4">

        {/* Action buttons — hidden on print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button onClick={() => navigate('/clerk/requests')} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
              <Printer size={15} /> Print
            </button>
            <button onClick={handleDownloadPDF} disabled={loading || issuing}
              className="btn-primary flex items-center gap-2">
              <Download size={15} />
              {loading ? 'Generating PDF…' : issuing ? 'Issuing…' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Certificate issued confirmation */}
        {cert && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-2 rounded-lg text-sm print:hidden">
            <CheckCircle size={16} /> Certificate issued and saved · No. {certNumber}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            CERTIFICATE DOCUMENT
        ═══════════════════════════════════════════════════════════ */}
        <div ref={certRef} className="relative bg-white shadow-2xl print:shadow-none text-black"
          style={{ minHeight: '297mm', fontFamily: 'serif' }}>

          {/* Outer border */}
          <div className="absolute inset-3 border-4 border-[#1e3a8a] pointer-events-none" />
          {/* Inner border */}
          <div className="absolute inset-5 border border-[#c5a26b] pointer-events-none" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
            <span className="text-[180px] font-black tracking-widest text-black rotate-[-30deg]">VERA</span>
          </div>

          <div className="relative z-10 flex flex-col min-h-full px-16 py-12">

            {/* ── Header ── */}
            <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-1">Federal Democratic Republic of Ethiopia</p>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-[#1e3a8a]">
                Vital Events Registration Authority
              </h1>
              <p className="text-sm text-gray-500 mt-1">Ifa Bula Kebele Administration · Woreda 03</p>
              <div className="mt-4 inline-block border-2 border-[#1e3a8a] px-6 py-1">
                <p className="text-lg font-bold tracking-[0.2em] uppercase text-[#1e3a8a]">
                  Certificate of {typeLabel}
                </p>
              </div>
            </div>

            {/* ── Intro text ── */}
            <p className="text-center text-base mb-8 leading-relaxed text-gray-700">
              This is to officially certify that the following information has been duly recorded
              in the registers of the Vital Events Registration Authority in accordance with the
              laws of the Federal Democratic Republic of Ethiopia.
            </p>

            {/* ── Certificate data ── */}
            <div className="border border-gray-200 rounded p-6 mb-8 bg-gray-50/50">
              {request.type === 'birth' && (
                <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                  <Field label="Full Name of Child"  value={request.childName} />
                  <Field label="Date of Birth"       value={request.dateOfBirth} />
                  <Field label="Place of Birth"      value={request.placeOfBirth || 'Ifa Bula Kebele'} />
                  <Field label="Gender"              value={request.childGender} />
                  <Field label="Father's Full Name"  value={request.residentId?.fatherName ?? '—'} />
                  <Field label="Mother's Full Name"  value={request.residentId?.motherName ?? '—'} />
                  <Field label="Kebele"              value={`Kebele ${request.residentId?.kebele ?? '03'}`} />
                  <Field label="Registration Date"   value={issueDate.toLocaleDateString('en-ET')} />
                </div>
              )}
              {request.type === 'death' && (
                <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                  <Field label="Full Name of Deceased" value={request.deceasedName} />
                  <Field label="Date of Death"          value={request.dateOfDeath} />
                  <Field label="Place of Death"         value={request.placeOfDeath || '—'} />
                  <Field label="Cause of Death"         value={request.causeOfDeath || '—'} />
                  <Field label="Kebele"                 value={`Kebele ${request.residentId?.kebele ?? '03'}`} />
                  <Field label="Registration Date"      value={issueDate.toLocaleDateString('en-ET')} />
                </div>
              )}
              {request.type === 'residency' && (
                <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm">
                  <Field label="Full Name"          value={request.residentName} />
                  <Field label="Kebele"             value={`Kebele ${request.residentId?.kebele ?? '03'}`} />
                  <Field label="House Number"       value={request.residentId?.houseNo ?? '—'} />
                  <Field label="Purpose"            value={request.purpose || '—'} />
                  <Field label="Issue Date"         value={issueDate.toLocaleDateString('en-ET')} />
                  <Field label="Valid Until"        value={new Date(issueDate.getFullYear() + 1, issueDate.getMonth(), issueDate.getDate()).toLocaleDateString('en-ET')} />
                </div>
              )}
            </div>

            {/* ── Certificate number ── */}
            <div className="flex justify-between items-center mb-10 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Certificate Number</p>
                <p className="font-mono font-bold text-lg text-[#1e3a8a]">{certNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">Date of Issue</p>
                <p className="font-medium">{issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Issued At</p>
                <p className="font-medium">Addis Ababa, Ethiopia</p>
              </div>
            </div>

            <CertificateSignatureBlock
              signature={cert?.digitalSignature ?? cert?.data?.digitalSignature}
              fallbackName={cert?.issuedByName ?? user?.name}
              verifyURL={cert ? verifyURL : ''}
              showQr={!!cert}
            />

            {/* Security note */}
            <p className="text-center text-[10px] text-gray-400 mt-6">
              This certificate is electronically generated and registered under No. {certNumber}.
              Verify at: {verifyURL}
            </p>

          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="border-b border-gray-100 pb-2">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  );
}