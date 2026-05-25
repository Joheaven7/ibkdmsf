// src/pages/clerk/CreateDivorceCertificate.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Scissors, Download, Printer } from 'lucide-react';

export default function CreateDivorceCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { divorces } = useData();

  const [record, setRecord] = useState(null);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issueDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [officerName] = useState("Abebe Kebede");

  useEffect(() => {
    const found = divorces.find(d => String(d.id) === String(id));
    if (found) {
      setRecord(found);
      setCertificateNumber(
        `DIV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      );
    }
  }, [id, divorces]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      alert(`Divorce Certificate (${certificateNumber}) generated successfully!`);
      navigate('/clerk/marriage-divorce');
    }, 1500);
  };

  if (!record) {
    return (
      <div className="text-center py-20 text-gray-500">
        Divorce record not found or has been removed.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-10 print:bg-white text-black">
      <div className="max-w-6xl mx-auto px-4">

        {/* CERTIFICATE */}
        <div className="relative bg-white shadow-2xl flex flex-col min-h-[750px] overflow-hidden print:shadow-none">

          {/* Borders */}
          <div className="absolute inset-2 border-4 border-[#1e3a8a]" />
          <div className="absolute inset-6 border-2 border-[#c5a26b]" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-[200px] font-bold text-black">VE</span>
          </div>

          {/* HEADER */}
          <div className="text-center pt-10 pb-6 border-b-2 border-black px-10 z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-widest uppercase">
              Federal Democratic Republic of Ethiopia
            </h1>

            <p className="text-lg mt-2">
              Vital Events Registration Authority
            </p>

            <p className="text-xl font-semibold mt-3 tracking-wider">
              OFFICIAL CERTIFICATE
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-amber-700">
              <Scissors size={30} />
              <span className="text-lg font-semibold">DIVORCE CERTIFICATE</span>
            </div>
          </div>

          {/* BODY */}
          <div className="px-16 py-10 text-center flex-1 z-10">

            <h2 className="text-4xl md:text-5xl font-serif font-bold underline mb-8">
              Certificate of Divorce
            </h2>

            <p className="text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
              This is to officially certify that the marriage between the following parties
              has been legally dissolved in accordance with the laws of the
              Federal Democratic Republic of Ethiopia.
            </p>

            {/* PARTIES */}
            <div className="grid grid-cols-2 gap-10 text-lg max-w-3xl mx-auto text-left">

              <div>
                <p className="font-semibold">Party One</p>
                <p className="break-words">
                  {record.applicantName || record.partner1}
                </p>
              </div>

              <div>
                <p className="font-semibold">Party Two</p>
                <p className="break-words">
                  {record.partnerName || record.partner2}
                </p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-3 gap-6 mt-10 text-lg max-w-4xl mx-auto text-left">

              <p>
                <strong>Date of Divorce:</strong><br />
                {record.date}
              </p>

              <p>
                <strong>Kebele:</strong><br />
                {record.kebele || '03'}
              </p>

              <p>
                <strong>Reason:</strong><br />
                {record.reason || 'Mutual Consent'}
              </p>
            </div>

            {/* CERTIFICATE INFO */}
            <div className="mt-12 flex justify-between items-end px-6">

              <div>
                <p className="text-sm">Certificate Number</p>
                <p className="font-mono text-xl font-bold">
                  {certificateNumber}
                </p>

                <p className="text-sm mt-2">
                  Issued at: Addis Ababa
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm">Issued On</p>
                <p className="font-medium">
                  {new Date(issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end px-16 pt-6 pb-10 mt-auto z-10">

            {/* Officer */}
            <div>
              <div className="h-px w-52 bg-black mb-1" />
              <p className="font-serif italic text-lg">{officerName}</p>
              <p className="text-sm">Chief Registrar</p>
              <p className="text-xs">License No: VE-2045</p>
            </div>

            {/* Seal */}
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-red-600 rounded-full flex items-center justify-center text-red-600 font-bold text-xl rotate-12">
                SEAL
              </div>
            </div>

            {/* Approval */}
            <div className="text-right">
              <div className="h-px w-52 bg-black mb-1" />
              <p className="text-sm">Approved By</p>
              <p className="font-medium">Director, Vital Events</p>
            </div>

          </div>

          {/* SECURITY NOTE */}
          <div className="text-center pb-4 text-xs z-10">
            This certificate is electronically generated and valid without physical signature.
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 justify-center mt-8 print:hidden">

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-2xl font-semibold text-lg"
          >
            <Download size={26} />
            {loading ? "Generating PDF..." : "Download Certificate"}
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-3 border border-black px-8 py-4 rounded-2xl"
          >
            <Printer size={26} />
            Print
          </button>

        </div>

      </div>
    </div>
  );
}