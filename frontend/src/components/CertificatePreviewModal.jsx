// src/components/CertificatePreviewModal.jsx
import { X } from 'lucide-react';

export default function CertificatePreviewModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-auto">
      
      <div className="bg-white max-w-6xl w-full rounded-2xl shadow-2xl relative overflow-hidden">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 bg-white border border-gray-300 rounded-full p-2 shadow"
        >
          <X size={26} />
        </button>

        {/* CERTIFICATE */}
        <div className="relative bg-white flex flex-col min-h-[700px] text-black">

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
              CERTIFICATE OF {request.type.toUpperCase()}
            </p>
          </div>

          {/* BODY */}
          <div className="px-16 py-10 text-center flex-1 z-10">

            <p className="text-2xl font-serif mb-8">
              This is to certify that
            </p>

            <div className="text-left max-w-2xl mx-auto space-y-4 text-lg">

              {request.type === 'birth' && (
                <>
                  <p className="break-words"><strong>Child Name:</strong> {request.childName}</p>
                  <p className="break-words"><strong>Date of Birth:</strong> {request.dateOfBirth}</p>
                  <p className="break-words"><strong>Gender:</strong> {request.gender}</p>
                  <p className="break-words"><strong>Father:</strong> {request.fatherName}</p>
                  <p className="break-words"><strong>Mother:</strong> {request.motherName}</p>
                </>
              )}

              {request.type === 'death' && (
                <>
                  <p className="break-words"><strong>Deceased:</strong> {request.deceasedName}</p>
                  <p className="break-words"><strong>Date of Death:</strong> {request.dateOfDeath}</p>
                </>
              )}

            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end px-16 pt-6 pb-10 mt-auto z-10">

            {/* Signature */}
            <div>
              <div className="h-px w-52 bg-black mb-1" />
              <p className="font-serif italic text-lg">Chief Registrar</p>
              <p className="text-sm">Vital Events Registration Authority</p>
            </div>

            {/* Seal */}
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-red-600 rounded-full flex items-center justify-center text-red-600 font-bold text-xl rotate-12">
                SEAL
              </div>
            </div>

          </div>

          {/* SECURITY NOTE */}
          <div className="text-center pb-4 text-xs text-gray-500 z-10">
            This certificate preview is an official representation of the registered record.
          </div>

        </div>
      </div>
    </div>
  );
}