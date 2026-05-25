// src/pages/clerk/CreateMarriageCertificate.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Download, Printer } from 'lucide-react';

export default function CreateMarriageCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marriages } = useData();

  const [record, setRecord] = useState(null);
  const [certNumber, setCertNumber] = useState('');
  const [issueDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const found = marriages.find(m => String(m.id) === String(id));
    if (found) {
      setRecord(found);
      setCertNumber(
        `MAR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      );
    }
  }, [id, marriages]);

  const handleDownload = () => {
    alert(`Marriage Certificate (${certNumber}) generated successfully!`);
    navigate('/clerk/marriage-divorce');
  };

  if (!record) {
    return <div className="text-center py-20">Record not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 py-10 print:bg-white text-black">
      <div className="max-w-6xl mx-auto px-4">

        {/* CERTIFICATE */}
        <div className="relative bg-white shadow-2xl flex flex-col min-h-[750px] print:shadow-none overflow-hidden">

          {/* Borders */}
          <div className="absolute inset-2 border-4 border-[#1e3a8a]" />
          <div className="absolute inset-6 border-2 border-[#c5a26b]" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="text-[200px] font-bold">VE</span>
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
          </div>

          {/* BODY */}
          <div className="px-16 py-10 text-center flex-1 z-10">

            <h2 className="text-4xl md:text-5xl font-serif font-bold underline mb-6">
              Certificate of Marriage
            </h2>

            <p className="text-lg leading-relaxed max-w-3xl mx-auto mb-10">
              This is to officially certify that the marriage between the following individuals
              has been duly registered in accordance with the laws of the
              Federal Democratic Republic of Ethiopia.
            </p>

            {/* COUPLE DETAILS */}
            <div className="grid grid-cols-2 gap-10 text-lg max-w-3xl mx-auto text-left">

              <div>
                <p className="font-semibold">Husband</p>
                <p className="break-words">
                  {record.husbandName || record.applicantName}
                </p>
              </div>

              <div>
                <p className="font-semibold">Wife</p>
                <p className="break-words">
                  {record.wifeName || record.spouseName}
                </p>
              </div>

              <p className="break-words">
                <strong>Date of Marriage:</strong> {record.date}
              </p>

              <p className="break-words">
                <strong>Kebele:</strong> {record.kebele}
              </p>
            </div>

            {/* META */}
            <div className="mt-12 flex justify-between items-end px-6">

              <div>
                <p className="text-sm">Certificate Number</p>
                <p className="font-mono text-xl font-bold">{certNumber}</p>

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

            {/* Signature */}
            <div>
              <div className="h-px w-52 bg-black mb-1" />
              <p className="font-serif italic text-lg">Abebe Kebede</p>
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

          {/* SECURITY TEXT */}
          <div className="text-center pb-4 text-xs z-10">
            This certificate is electronically generated and is valid without a physical signature.
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 justify-center mt-8 print:hidden">

          <button
            onClick={handleDownload}
            className="flex items-center gap-3 bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-2xl font-semibold text-lg"
          >
            <Download size={26} />
            Download Certificate
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