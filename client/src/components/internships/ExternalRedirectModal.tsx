import React from 'react';
import { Modal } from '../common/Modal';
import { ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ExternalRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipTitle: string;
  companyName: string;
  destinationUrl: string;
  destinationDomain: string;
  onConfirmedOpen: () => void;
}

export const ExternalRedirectModal: React.FC<ExternalRedirectModalProps> = ({
  isOpen,
  onClose,
  internshipTitle,
  companyName,
  destinationUrl,
  destinationDomain,
  onConfirmedOpen,
}) => {
  const handleProceed = () => {
    // Open external URL safely in new window
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
    onConfirmedOpen();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Navigating to External Application Portal" maxWidth="lg">
      <div className="space-y-5 text-slate-700">
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-900 leading-relaxed">
            <span className="font-bold">Official Application Portal:</span> You are navigating to the external employer application site for{' '}
            <strong>{internshipTitle}</strong> at <strong>{companyName}</strong>.
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Destination Domain
          </label>
          <div className="px-3.5 py-2.5 bg-slate-100 rounded-lg text-sm font-mono font-semibold text-slate-900 break-all border border-slate-200">
            {destinationDomain}
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Notice:</strong> Opening this link does NOT record you as having applied.
            InternFit does not transmit your personal data or resume to third-party portals automatically.
            After submitting your application on the employer page, return here and click{' '}
            <strong className="underline">"I've Applied"</strong> to record your submission.
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            <span>Proceed to External Site</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
