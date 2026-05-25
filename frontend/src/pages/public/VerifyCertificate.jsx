import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, Search, Building2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyCertificate() {
  const { number } = useParams();

  const [certNum, setCertNum] = useState(number ?? '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = certNum.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Verification failed.');
        return;
      }
      setResult(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [certNum]);

  useEffect(() => {
    if (!number?.trim()) return;
    const normalized = number.trim().toUpperCase();
    setCertNum(normalized);
    (async () => {
      setLoading(true);
      setResult(null);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(normalized)}`);
        const data = await res.json();
        if (!res.ok) setError(data.message || 'Verification failed.');
        else setResult(data);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [number]);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col">

      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-800 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-primary-800 dark:text-emerald font-display text-sm">IBKDMS</span>
        </Link>
        <span className="text-sm text-gray-500 dark:text-gray-400">Certificate Verification</span>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-primary-700 dark:text-emerald" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Verify Certificate</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter a certificate number to verify its authenticity
            </p>
          </div>

          <form onSubmit={handleVerify} className="card p-6 space-y-4">
            <div>
              <label className="label">Certificate Number</label>
              <input
                className="input-field font-mono"
                placeholder="e.g. BIR-2025-123456"
                value={certNum}
                onChange={(e) => setCertNum(e.target.value.toUpperCase())}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certNum.trim()}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={15} />
              )}
              {loading ? 'Verifying…' : 'Verify Certificate'}
            </button>
          </form>

          {error && (
            <div className="mt-4 card p-5 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 flex items-center gap-3">
              <ShieldX size={24} className="text-red-600 shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div
              className={`mt-4 card p-6 ${
                result.valid
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {result.valid ? (
                  <ShieldCheck size={28} className="text-green-600 dark:text-green-400" />
                ) : (
                  <ShieldX size={28} className="text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p
                    className={`font-bold text-lg ${
                      result.valid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                    }`}
                  >
                    {result.valid ? 'Certificate is VALID' : 'Certificate is REVOKED'}
                  </p>
                  <p className="text-xs text-gray-500">{result.status}</p>
                </div>
              </div>

              {result.data && (
                <div className="space-y-2 text-sm">
                  {[
                    ['Certificate No.', result.data.certificateNumber],
                    ['Type', result.data.type?.charAt(0).toUpperCase() + result.data.type?.slice(1)],
                    ['Resident Name', result.data.residentName],
                    ['Issued By', result.data.issuedByName],
                    [
                      'Issue Date',
                      new Date(result.data.issuedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }),
                    ],
                    ['Kebele', `Kebele ${result.data.kebele}`],
                    ...(result.data.digitalSignature?.officerName
                      ? [['Signed By', result.data.digitalSignature.officerName]]
                      : []),
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1.5 last:border-0"
                    >
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
