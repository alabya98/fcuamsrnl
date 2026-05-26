import { useState, useEffect } from "react";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";

interface ParentConsentViewProps {
  athlete: any;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
  documentType: "Parent Consent" | "Valid ID" | "School ID";
}

const ParentConsentView = ({
  documents,
  canViewFiles,
  documentType,
}: ParentConsentViewProps) => {
  const { user } = useAuth();
  const latestDocument = documents.length > 0 ? documents[0] : null;
  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";
  const canReview = isAdmin || isCoach;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [inlineUrl, setInlineUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingInline, setLoadingInline] = useState(false);

  // Fetch and display the image inline as soon as the document is available
  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchInline = async () => {
      if (!latestDocument || !canViewFiles) return;
      try {
        setLoadingInline(true);
        const response = await AthleteDocumentService.downloadDocument(
          latestDocument.document_id,
        );
        const blob = new Blob([response.data], {
          type: latestDocument.file_type,
        });
        objectUrl = window.URL.createObjectURL(blob);
        setInlineUrl(objectUrl);
      } catch {
        setInlineUrl(null);
      } finally {
        setLoadingInline(false);
      }
    };

    fetchInline();

    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [latestDocument?.document_id, canViewFiles]);

  const handleOpenFullscreen = () => {
    if (inlineUrl) {
      setPreviewUrl(inlineUrl);
      setShowPreviewModal(true);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setShowPreviewModal(false);
  };

  const handleDownload = async (documentId: number, fileName: string) => {
    try {
      const response =
        await AthleteDocumentService.downloadDocument(documentId);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
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
    if (!latestDocument) return;
    try {
      setProcessing(true);
      await AthleteDocumentService.updateDocumentStatus(
        latestDocument.document_id,
        { status: "Approved", valid_until: validUntil || undefined },
      );
      toast.success("Document approved successfully");
      setShowApproveModal(false);
      setValidUntil("");
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
    if (!latestDocument || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      setProcessing(true);
      await AthleteDocumentService.updateDocumentStatus(
        latestDocument.document_id,
        { status: "Rejected", rejection_reason: rejectionReason },
      );
      toast.success("Document rejected");
      setShowRejectModal(false);
      setRejectionReason("");
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    if (status === "Rejected")
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    if (status === "Pending Review")
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

  const expiryBadgeColor = (days: number) =>
    days < 0
      ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
      : days < 30
        ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
        : "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";

  return (
    <>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{documentType}</h3>
              {latestDocument && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last uploaded: {new Date(latestDocument.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {latestDocument && (
            <span className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm ${getStatusColor(latestDocument.status)}`}>
              {getStatusIcon(latestDocument.status)}
              {latestDocument.status}
            </span>
          )}
        </div>

        {latestDocument ? (
          <>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-gray-200 dark:border-white/10">
              {/* File info row */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{latestDocument.file_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {latestDocument.file_size_formatted || `${(latestDocument.file_size / 1024).toFixed(2)} KB`}
                  </p>
                </div>
                {canViewFiles && inlineUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenFullscreen}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center gap-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      Fullscreen
                    </button>
                    <button
                      onClick={() => handleDownload(latestDocument.document_id, latestDocument.file_name)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                )}
              </div>

              {/* ── Inline image / PDF display ── */}
              {canViewFiles && (
                <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                  {loadingInline ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                    </div>
                  ) : inlineUrl && isImageFile(latestDocument.file_type) ? (
                    <img
                      src={inlineUrl}
                      alt={latestDocument.file_name}
                      className="w-full max-h-96 object-contain cursor-pointer"
                      onClick={handleOpenFullscreen}
                    />
                  ) : inlineUrl && isPdfFile(latestDocument.file_type) ? (
                    <iframe
                      src={inlineUrl}
                      className="w-full h-96"
                      title={latestDocument.file_name}
                    />
                  ) : inlineUrl ? (
                    <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400 text-sm font-medium">
                      Preview not available for this file type.
                    </div>
                  ) : null}
                </div>
              )}

              {/* Valid Until */}
              {latestDocument.status === "Approved" && latestDocument.valid_until && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">Valid Until:</p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-200">
                        {new Date(latestDocument.valid_until).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
                    </div>
                    {latestDocument.days_until_expiry !== undefined && (
                      <div className={`px-3 py-1 rounded-lg font-bold text-sm ${expiryBadgeColor(latestDocument.days_until_expiry)}`}>
                        {latestDocument.days_until_expiry < 0
                          ? `Expired ${Math.abs(Math.floor(latestDocument.days_until_expiry))} days ago`
                          : `${latestDocument.days_until_expiry} days remaining`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {latestDocument.rejection_reason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{latestDocument.rejection_reason}</p>
                </div>
              )}

              {/* Notes */}
              {latestDocument.notes && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Notes:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">{latestDocument.notes}</p>
                </div>
              )}
            </div>

            {/* Review actions */}
            {canReview && latestDocument.status === "Pending Review" && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-2 border-blue-200 dark:border-blue-500/20 rounded-xl">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">
                  📋 Review Required: This document is pending your approval
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {processing ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg">No document uploaded yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Athlete hasn't submitted their {documentType.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {showPreviewModal && previewUrl && latestDocument && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{latestDocument.file_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{documentType}</p>
              </div>
              <button onClick={closePreview} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-[#252b3b]">
              {isImageFile(latestDocument.file_type) ? (
                <img src={previewUrl} alt={latestDocument.file_name} className="max-w-full max-h-full mx-auto object-contain" />
              ) : isPdfFile(latestDocument.file_type) ? (
                <iframe src={previewUrl} className="w-full h-full min-h-[600px]" title={latestDocument.file_name} />
              ) : null}
            </div>
            {canReview && latestDocument.status === "Pending Review" && (
              <div className="p-4 border-t-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1f2e]">
                <div className="flex items-center justify-end gap-3">
                  <button onClick={closePreview} className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 font-semibold text-sm transition-all">Close</button>
                  <button
                    onClick={() => { closePreview(); setShowRejectModal(true); }}
                    disabled={processing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                  <button
                    onClick={() => { closePreview(); setShowApproveModal(true); }}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Approve Document</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Set an expiration date for this document. The athlete will need to re-upload when it expires.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Valid Until (Optional)</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={getMinDate()}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-500/20 transition-all"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty if the document doesn't expire</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowApproveModal(false); setValidUntil(""); }}
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
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Reject Document</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejecting this document. This will be shown to the athlete.
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
                onClick={() => { setShowRejectModal(false); setRejectionReason(""); }}
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

export default ParentConsentView;