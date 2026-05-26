// client/src/pages/Reports/Components/PrintPreviewModal.tsx

import type { ReactNode } from "react";

interface PrintPreviewModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "pdf" | "excel";
  children: ReactNode;
}

const PrintPreviewModal = ({
  show,
  onClose,
  onConfirm,
  type,
  children,
}: PrintPreviewModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-white">PDF Preview</h2>
            <p className="text-blue-100 text-sm mt-1">
              Review your report before downloading
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
            {children}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t-2 border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Preview Mode</p>
            <p className="text-xs">
              This is how your {type.toUpperCase()} will look when downloaded
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Download {type.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;