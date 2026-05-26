import { useState, useEffect } from "react";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";

interface MedicalRecordsViewProps {
  athlete: any;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
}

// Per-document inline fetcher
const useInlineDocument = (
  doc: AthleteDocumentColumns,
  canViewFiles: boolean,
) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canViewFiles) return;
    let objectUrl: string | null = null;

    const fetch = async () => {
      try {
        setLoading(true);
        const response = await AthleteDocumentService.downloadDocument(
          doc.document_id,
        );
        const blob = new Blob([response.data], { type: doc.file_type });
        objectUrl = window.URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [doc.document_id, canViewFiles]);

  return { url, loading };
};

// Individual medical doc card with its own inline fetch
const MedicalDocCard = ({
  doc,
  canViewFiles,
  canReview,
  onApprove,
  onReject,
  onFullscreen,
  onDownload,
}: {
  doc: AthleteDocumentColumns;
  canViewFiles: boolean;
  canReview: boolean;
  onApprove: (doc: AthleteDocumentColumns) => void;
  onReject: (doc: AthleteDocumentColumns) => void;
  onFullscreen: (doc: AthleteDocumentColumns, url: string) => void;
  onDownload: (id: number, name: string) => void;
}) => {
  const { url: blobUrl, loading: blobLoading } = useInlineDocument(
    doc,
    canViewFiles,
  );

  const isImageFile = (ft: string) => ft?.startsWith("image/");
  const isPdfFile = (ft: string) => ft === "application/pdf";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "Rejected":
        return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      case "Pending Review":
        return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const expiryBadgeColor = (days: number) =>
    days < 0
      ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
      : days < 30
        ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
        : "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";

  return (
    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border-2 border-gray-200 dark:border-white/10">
      {/* Name + status */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-800 dark:text-white">
              {doc.file_name}
            </p>
            <span
              className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(doc.status)}`}
            >
              {doc.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(doc.created_at).toLocaleDateString()} •{" "}
            {doc.file_size_formatted ||
              `${(doc.file_size / 1024).toFixed(2)} KB`}
          </p>
        </div>
      </div>

      {/* ── Inline image / PDF ── */}
      {canViewFiles && (
        <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
          {blobLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : blobUrl && isImageFile(doc.file_type) ? (
            <img
              src={blobUrl}
              alt={doc.file_name}
              className="w-full max-h-48 object-contain cursor-pointer"
              onClick={() => onFullscreen(doc, blobUrl)}
            />
          ) : blobUrl && isPdfFile(doc.file_type) ? (
            <iframe
              src={blobUrl}
              className="w-full h-48"
              title={doc.file_name}
            />
          ) : blobUrl ? (
            <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400 text-xs font-medium">
              Preview not available for this file type
            </div>
          ) : null}
        </div>
      )}

      {/* Valid until */}
      {doc.status === "Approved" && doc.valid_until && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                Valid Until:
              </p>
              <p className="text-sm font-bold text-green-900 dark:text-green-200">
                {new Date(doc.valid_until).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {doc.days_until_expiry !== undefined && (
              <div
                className={`px-2 py-1 rounded-lg font-bold text-xs ${expiryBadgeColor(doc.days_until_expiry)}`}
              >
                {doc.days_until_expiry < 0
                  ? "Expired"
                  : `${Math.floor(doc.days_until_expiry)} days left`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection reason */}
      {doc.rejection_reason && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-lg">
          <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
            Rejection Reason:
          </p>
          <p className="text-xs text-red-700 dark:text-red-400">
            {doc.rejection_reason}
          </p>
        </div>
      )}

      {/* Notes */}
      {doc.notes && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
            Notes:
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            {doc.notes}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {canViewFiles && blobUrl && (
          <>
            <button
              onClick={() => onFullscreen(doc, blobUrl)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-xs flex items-center gap-1 transition-all"
            >
              Fullscreen
            </button>
            <button
              onClick={() => onDownload(doc.document_id, doc.file_name)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs flex items-center gap-1 transition-all"
            >
              Download
            </button>
          </>
        )}
        {canReview && doc.status === "Pending Review" && (
          <>
            <button
              onClick={() => onApprove(doc)}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-xs flex items-center gap-1 transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => onReject(doc)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-xs flex items-center gap-1 transition-all"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const MedicalRecordsView = ({
  documents,
  canViewFiles,
}: MedicalRecordsViewProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";
  const canReview = isAdmin || isCoach;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<AthleteDocumentColumns | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleFullscreen = (doc: AthleteDocumentColumns, url: string) => {
    setSelectedDocument(doc);
    setPreviewUrl(url);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setSelectedDocument(null);
    setShowPreviewModal(false);
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const response =
        await AthleteDocumentService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Document downloaded");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to download document",
      );
    }
  };

  const handleApprove = async () => {
    if (!selectedDocument) return;
    try {
      setProcessing(true);
      await AthleteDocumentService.updateDocumentStatus(
        selectedDocument.document_id,
        {
          status: "Approved",
          valid_until: validUntil || undefined,
        },
      );
      toast.success("Document approved successfully");
      setShowApproveModal(false);
      setValidUntil("");
      setSelectedDocument(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to approve document",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      setProcessing(true);
      await AthleteDocumentService.updateDocumentStatus(
        selectedDocument.document_id,
        {
          status: "Rejected",
          rejection_reason: rejectionReason,
        },
      );
      toast.success("Document rejected");
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedDocument(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to reject document",
      );
    } finally {
      setProcessing(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Physical Exam":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300";
      case "Injury Report":
        return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      case "Medical Clearance":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      default:
        return "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300";
    }
  };

  const isImageFile = (ft: string) => ft?.startsWith("image/");
  const isPdfFile = (ft: string) => ft === "application/pdf";

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const groupedDocuments = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.document_type]) acc[doc.document_type] = [];
      acc[doc.document_type].push(doc);
      return acc;
    },
    {} as Record<string, AthleteDocumentColumns[]>,
  );

  return (
    <>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Medical Documents
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                uploaded
              </p>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg mb-2">
              No medical documents uploaded
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Athlete hasn't submitted medical records yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedDocuments).map(([type, docs]) => (
              <div
                key={type}
                className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-4"
              >
                <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm ${getTypeColor(type)}`}
                  >
                    {type}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({docs.length})
                  </span>
                </h4>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <MedicalDocCard
                      key={doc.document_id}
                      doc={doc}
                      canViewFiles={canViewFiles}
                      canReview={canReview}
                      onApprove={(d) => {
                        setSelectedDocument(d);
                        setShowApproveModal(true);
                      }}
                      onReject={(d) => {
                        setSelectedDocument(d);
                        setShowRejectModal(true);
                      }}
                      onFullscreen={handleFullscreen}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {showPreviewModal && previewUrl && selectedDocument && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedDocument.file_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDocument.document_type}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6 text-gray-600 dark:text-gray-300"
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
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-[#252b3b]">
              {isImageFile(selectedDocument.file_type) ? (
                <img
                  src={previewUrl}
                  alt={selectedDocument.file_name}
                  className="max-w-full max-h-full mx-auto object-contain"
                />
              ) : isPdfFile(selectedDocument.file_type) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px]"
                  title={selectedDocument.file_name}
                />
              ) : null}
            </div>
            {canReview && selectedDocument.status === "Pending Review" && (
              <div className="p-4 border-t-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1f2e]">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={closePreview}
                    className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 font-semibold text-sm transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closePreview();
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      closePreview();
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Approve Document
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Set an expiration date for this document.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Valid Until (Optional)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty if the document doesn't expire
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setValidUntil("");
                  setSelectedDocument(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Reject Document
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this document.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 transition-all mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedDocument(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all disabled:opacity-50"
              >
                {processing ? "Processing..." : "Reject Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalRecordsView;
