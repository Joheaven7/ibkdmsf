import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Download, Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import CertificateSignatureBlock from '../../components/CertificateSignatureBlock';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const VERIFY_BASE = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export default function CreateMigrationCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { migrations, residents } = useData();
  const { user } = useAuth();
  const certRef = useRef(null);

  const [record, setRecord] = useState(null);
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    const found = migrations.find((m) => String(m._id) === String(id));
    setRecord(found ?? null);
  }, [id, migrations]);

  useEffect(() => {
    if (!record || record.status !== 'approved') return;
    const resident = record.residentId
      ? residents.find((r) => String(r._id) === String(record.residentId?._id ?? record.residentId))
      : null;

    setIssuing(true);
    api.post('/certificates', {
      migrationId: record._id,
      type: 'migration',
      residentId: resident?._id ?? record.residentId?._id ?? record.residentId ?? null,
      residentName: record.fullName,
      kebele: record.kebele,
      data: {
        fullName: record.fullName,
        migrationType: record.migrationType,
        fromKebele: record.fromKebele,
        toKebele: record.toKebele,
        date: record.date,
        reason: record.reason,
      },
    })
      .then((res) => setCert(res.data))
      .catch((err) => toast.error('Failed to issue certificate: ' + err.message))
      .finally(() => setIssuing(false));
  }, [record, residents]);

  const handlePrint = () => window.print();
  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${cert?.certificateNumber ?? 'migration-cert'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
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

  if (!record) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Migration record not found.</p>
        <button type="button" onClick={() => navigate('/clerk/migrations')} className="btn-secondary mx-auto flex items-center gap-2">
          <ArrowLeft size={15} /> Back
        </button>
      </div>
    );
  }

  if (record.status !== 'approved') {
    return (
      <div className="text-center py-20">
        <p className="text-amber-600 mb-4">Migration must be approved before issuing a certificate.</p>
        <button type="button" onClick={() => navigate('/clerk/migrations')} className="btn-secondary mx-auto">Back</button>
      </div>
    );
  }

  const certNumber = cert?.certificateNumber ?? '…';
  const verifyURL = `${VERIFY_BASE}/verify/${certNumber}`;

  return (
    <div id="certificate-print-root">
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 py-10 print:bg-white print:py-0">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 print:hidden">
            <button type="button" onClick={() => navigate('/clerk/migrations')} className="btn-secondary flex items-center gap-2">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                <Printer size={15} /> Print
              </button>
              <button type="button" onClick={handleDownloadPDF} disabled={loading || issuing} className="btn-primary flex items-center gap-2">
                <Download size={15} />
                {loading ? 'Generating…' : issuing ? 'Issuing…' : 'Download PDF'}
              </button>
            </div>
          </div>

          {cert && (
            <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm print:hidden">
              <CheckCircle size={16} /> Certificate issued · {certNumber}
            </div>
          )}

          <div ref={certRef} className="relative bg-white shadow-2xl print:shadow-none text-black p-12" style={{ minHeight: '297mm', fontFamily: 'serif' }}>
            <div className="absolute inset-3 border-4 border-[#0F5B4F] pointer-events-none" />
            <div className="absolute inset-5 border border-[#D4A017] pointer-events-none" />

            <div className="relative z-10 text-center space-y-6">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-500">Federal Democratic Republic of Ethiopia</p>
              <h1 className="text-2xl font-bold text-[#0F5B4F] uppercase tracking-wider">Migration Certificate</h1>
              <p className="text-sm text-gray-600">Ifa Bula Kebele · Woreda 03</p>

              <p className="text-base leading-relaxed max-w-lg mx-auto text-gray-700">
                This certifies that the migration of the person named below has been registered with the kebele administration.
              </p>

              <div className="text-left max-w-md mx-auto space-y-3 text-sm border border-gray-200 rounded-lg p-6 bg-gray-50">
                <Row label="Full Name" value={record.fullName} />
                <Row label="Type" value={record.migrationType === 'incoming' ? 'Incoming' : 'Outgoing'} />
                <Row label="From" value={record.fromKebele || record.fromWoreda || '—'} />
                <Row label="To" value={record.toKebele || record.toWoreda || '—'} />
                <Row label="Migration Date" value={record.date} />
                <Row label="Certificate No." value={certNumber} />
                <Row label="Issued By" value={cert?.issuedByName ?? user?.name} />
                <Row label="Kebele" value={`Kebele ${record.kebele}`} />
              </div>

              <CertificateSignatureBlock
                signature={cert?.digitalSignature ?? cert?.data?.digitalSignature}
                fallbackName={cert?.issuedByName ?? user?.name}
                verifyURL={cert ? verifyURL : ''}
                showQr={!!cert}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold capitalize">{value}</span>
    </div>
  );
}
