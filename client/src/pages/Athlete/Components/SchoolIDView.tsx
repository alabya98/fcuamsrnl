import { useState, useEffect } from "react";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";

interface SchoolIDViewProps {
  athlete: any;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
}

// Hook to fetch and cache a single document's blob URL
const useInlineDocument = (
  doc: AthleteDocumentColumns | undefined,
  canViewFiles: boolean,
) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!doc || !canViewFiles) return;
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
  }, [doc?.document_id, canViewFiles]);

  return { url, loading };
};

const SchoolIDView = ({ documents, canViewFiles }: SchoolIDViewProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";
  const canReview = isAdmin || isCoach;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AthleteDocumentColumns | null>(
    null,
  );
  const [selectedDocument, setSelectedDocument] =
    useState<AthleteDocumentColumns | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [processing, setProcessing] = useState(false);

  const frontDoc = documents.find(
    (d) =>
      d.file_name.toLowerCase().includes("front") ||
      d.notes?.toLowerCase().includes("front"),
  );
  const backDoc = documents.find(
    (d) =>
      d.file_name.toLowerCase().includes("back") ||
      d.notes?.toLowerCase().includes("back"),
  );

  const { url: frontUrl, loading: frontLoading } = useInlineDocument(
    frontDoc,
    canViewFiles,
  );
  const { url: backUrl, loading: backLoading } = useInlineDocument(
    backDoc,
    canViewFiles,
  );

  const bothSidesApproved =
    frontDoc?.status === "Approved" && backDoc?.status === "Approved";
  const overallStatus = bothSidesApproved
    ? "Approved"
    : frontDoc?.status === "Pending Review" ||
        backDoc?.status === "Pending Review"
      ? "Pending Review"
      : frontDoc?.status === "Rejected" || backDoc?.status === "Rejected"
        ? "Rejected"
        : "Not Submitted";

  const handleOpenFullscreen = (
    doc: AthleteDocumentColumns,
    blobUrl: string,
  ) => {
    setPreviewDoc(doc);
    setPreviewUrl(blobUrl);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewDoc(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-500/30";
      case "Rejected":
        return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30";
      case "Pending Review":
        return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30";
      default:
        return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-white/20";
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "Approved")
      return (
        <svg
          className="w-5 h-5"
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
      );
    if (status === "Rejected")
      return (
        <svg
          className="w-5 h-5"
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
      );
    if (status === "Pending Review")
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    return null;
  };

  const isImageFile = (ft: string) => ft?.startsWith("image/");
  const isPdfFile = (ft: string) => ft === "application/pdf";

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const renderDocCard = (
    doc: AthleteDocumentColumns,
    label: string,
    blobUrl: string | null,
    blobLoading: boolean,
  ) => (
    <div className="border-2 border-gray-200 dark:border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800 dark:text-white">{label}</h4>
        <span
          className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(doc.status)}`}
        >
          {doc.status}
        </span>
      </div>

      <div className="space-y-3">
        {/* File info */}
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {doc.file_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(doc.created_at).toLocaleDateString()} •{" "}
            {doc.file_size_formatted}
          </p>
        </div>

        {/* ── Inline image / PDF ── */}
        {canViewFiles && (
          <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
            {blobLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : blobUrl && isImageFile(doc.file_type) ? (
              <img
                src={blobUrl}
                alt={doc.file_name}
                className="w-full max-h-48 object-contain cursor-pointer"
                onClick={() => handleOpenFullscreen(doc, blobUrl)}
              />
            ) : blobUrl && isPdfFile(doc.file_type) ? (
              <iframe
                src={blobUrl}
                className="w-full h-48"
                title={doc.file_name}
              />
            ) : blobUrl ? (
              <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400 text-xs font-medium">
                Preview not available
              </div>
            ) : null}
          </div>
        )}

        {/* Valid until */}
        {doc.valid_until && doc.status === "Approved" && (
          <div className="p-2 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                  Valid Until:
                </p>
                <p className="text-sm font-bold text-green-900 dark:text-green-200">
                  {new Date(doc.valid_until).toLocaleDateString()}
                </p>
              </div>
              {doc.days_until_expiry !== undefined &&
                doc.days_until_expiry !== null && (
                  <div
                    className={`px-2 py-1 rounded-lg font-bold text-xs ${
                      doc.days_until_expiry < 0
                        ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                        : doc.days_until_expiry < 30
                          ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                          : "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                    }`}
                  >
                    {doc.days_until_expiry < 0
                      ? `Expired ${Math.abs(Math.floor(doc.days_until_expiry))} days ago`
                      : `${Math.floor(doc.days_until_expiry)} days remaining`}
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Rejection reason */}
        {doc.rejection_reason && (
          <div className="p-2 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-lg">
            <p className="text-xs font-semibold text-red-800 dark:text-red-300">
              Rejection:
            </p>
            <p className="text-xs text-red-700 dark:text-red-400">
              {doc.rejection_reason}
            </p>
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
              Notes:
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {doc.notes}
            </p>
          </div>
        )}

        {/* Action buttons */}
        {canViewFiles && blobUrl && (
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenFullscreen(doc, blobUrl)}
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-xs transition-all"
            >
              Fullscreen
            </button>
            <button
              onClick={() => handleDownload(doc.document_id, doc.file_name)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition-all"
            >
              Download
            </button>
          </div>
        )}

        {canReview && doc.status === "Pending Review" && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setSelectedDocument(doc);
                setShowApproveModal(true);
              }}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-xs transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => {
                setSelectedDocument(doc);
                setShowRejectModal(true);
              }}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-xs transition-all"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                School ID
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Front and back sides
              </p>
            </div>
          </div>
          <span
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm ${getStatusColor(overallStatus)}`}
          >
            {getStatusIcon(overallStatus)}
            {overallStatus}
          </span>
        </div>

        {frontDoc || backDoc ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frontDoc ? (
              renderDocCard(frontDoc, "Front Side", frontUrl, frontLoading)
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Front side not uploaded
                </p>
              </div>
            )}
            {backDoc ? (
              renderDocCard(backDoc, "Back Side", backUrl, backLoading)
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Back side not uploaded
                </p>
              </div>
            )}
          </div>
        ) : (
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
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">
              No School ID uploaded yet
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Athlete hasn't submitted their school ID
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {showPreviewModal && previewUrl && previewDoc && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {previewDoc.file_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  School ID
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
              {isImageFile(previewDoc.file_type) ? (
                <img
                  src={previewUrl}
                  alt={previewDoc.file_name}
                  className="max-w-full max-h-full mx-auto object-contain"
                />
              ) : isPdfFile(previewDoc.file_type) ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[600px]"
                  title={previewDoc.file_name}
                />
              ) : null}
            </div>
            {canReview && previewDoc.status === "Pending Review" && (
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
                      setSelectedDocument(previewDoc);
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
                      setSelectedDocument(previewDoc);
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

export default SchoolIDView;
