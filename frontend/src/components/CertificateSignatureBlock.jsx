import { QRCodeSVG } from 'qrcode.react';
import { useI18n } from '../context/I18nContext';

/**
 * Official footer: digital signature + seal + QR
 */
export default function CertificateSignatureBlock({
  signature,
  fallbackName = '',
  verifyURL = '',
  showQr = true,
}) {
  const { t } = useI18n();
  const sig = signature ?? {};
  const officerName = sig.officerName || fallbackName || '—';
  const officerTitle = sig.officerTitle || t('certificate.registrar');
  const licenseId = sig.licenseId;
  const signedAt = sig.signedAt
    ? new Date(sig.signedAt).toLocaleDateString('en-ET', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-ET');

  return (
    <div className="mt-auto border-t border-gray-200 pt-8 flex justify-between items-end gap-4 flex-wrap">
      <div className="text-center min-w-[140px]">
        <p className="text-[9px] uppercase tracking-widest text-primary-800 font-semibold mb-2">
          {t('certificate.digitalSignature')}
        </p>
        <p className="font-serif italic text-lg text-gray-800 mb-1" style={{ fontFamily: 'cursive, serif' }}>
          {officerName}
        </p>
        <div className="w-40 border-b-2 border-primary-800 mb-1 mx-auto" />
        <p className="font-semibold text-sm text-gray-900">{officerName}</p>
        <p className="text-xs text-gray-600">{officerTitle}</p>
        {licenseId && (
          <p className="text-[10px] text-gray-500 mt-0.5">
            {t('certificate.licenseId')}: {licenseId}
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">
          {t('certificate.signedAt')}: {signedAt}
        </p>
      </div>

      <div className="text-center">
        <div className="w-24 h-24 border-4 border-double border-[#0F5B4F] rounded-full flex items-center justify-center mx-auto">
          <div className="text-center">
            <p className="text-[8px] font-bold text-[#0F5B4F] leading-tight">OFFICIAL</p>
            <p className="text-[7px] text-[#0F5B4F] leading-tight">IFA BULA</p>
            <p className="text-[7px] text-[#0F5B4F] leading-tight">KEBELE</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{t('certificate.officialSeal')}</p>
      </div>

      {showQr && verifyURL && (
        <div className="text-center">
          <QRCodeSVG value={verifyURL} size={80} level="H" />
          <p className="text-[9px] text-gray-400 mt-1 max-w-[80px] leading-tight mx-auto">
            {t('certificate.scanVerify')}
          </p>
        </div>
      )}
    </div>
  );
}
