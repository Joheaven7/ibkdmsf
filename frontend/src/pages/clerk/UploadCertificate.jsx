import { useState, useMemo }   from 'react';
import { useData }             from '../../context/DataContext';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import Modal                   from '../../components/Modal';
import api                     from '../../lib/api';
import toast                   from 'react-hot-toast';

export default function UploadCertificate() {
  const { requests, updateRequestStatus } = useData();

  // Only show approved requests that need a document upload
  const uploadable = useMemo(() =>
    requests.filter(r =>
      r.status === 'approved' &&
      !r.documents?.mainDocument
    ),
  [requests]);

  const [selected,   setSelected]   = useState(null);
  const [file,       setFile]       = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  const handleUpload = async () => {
    if (!selected || !file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('mainDocument', file);
      fd.append('status', 'approved');

      await api.upload(`/requests/${selected._id}/upload-document`, fd);
      toast.success('Certificate uploaded successfully!');
      setSelected(null);
      setFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') setFile(dropped);
    else toast.error('Only PDF files are allowed.');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display font-bold text-gray-900 dark:text-white">Upload Certificates</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upload signed PDF certificates for approved requests
        </p>
      </div>

      {uploadable.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="mx-auto mb-3 text-green-400" size={36} />
          <p className="text-gray-500 dark:text-gray-400 text-sm">All approved requests have certificates uploaded.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {uploadable.length} request{uploadable.length !== 1 ? 's' : ''} awaiting certificate upload
            </p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {uploadable.map(req => (
              <div key={req._id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <FileText size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                      {req.type} Certificate
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.residentName} · #{req._id?.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Approved: {new Date(req.updatedAt || req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelected(req); setFile(null); }}
                  className="btn-primary text-sm flex items-center gap-2">
                  <Upload size={14} /> Upload PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setFile(null); }} title="Upload Certificate PDF" size="sm">
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-900 dark:text-white capitalize">{selected.type} Certificate</p>
              <p className="text-gray-400 text-xs mt-0.5">{selected.residentName}</p>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : file
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
              }`}
              onClick={() => document.getElementById('cert-upload-input').click()}
            >
              <input
                id="cert-upload-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files[0];
                  if (f?.type === 'application/pdf') setFile(f);
                  else toast.error('Only PDF files allowed.');
                }}
              />
              {file ? (
                <>
                  <CheckCircle className="mx-auto mb-2 text-green-500" size={32} />
                  <p className="font-medium text-green-700 dark:text-green-400 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF only · Max 5MB</p>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setSelected(null); setFile(null); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleUpload} disabled={!file || uploading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {uploading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {uploading ? 'Uploading…' : 'Upload Certificate'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}