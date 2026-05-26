import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";

interface ParentConsentUploadProps {
  athlete: AthleteColumns;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
  onDocumentChange: () => void;
  documentType?: "Parent Consent" | "Valid ID";
}

const ParentConsentUpload = ({
  athlete,
  documents,
  canViewFiles,
  onDocumentChange,
  documentType = "Parent Consent",
}: ParentConsentUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const latestDocument = documents.length > 0 ? documents[0] : null;
  const canUpload = user?.role === "Athlete" || user?.role === "Coach";
  const isAdmin = user?.role === "Admin";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setNotes("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX",
      );
      return;
    }
    try {
      setUploading(true);
      const response = await AthleteDocumentService.uploadDocument({
        athlete_id: athlete.athlete_id,
        document_type: documentType,
        file: selectedFile,
        notes: notes || undefined,
      });
      if (response.status === 201) {
        toast.success("Document uploaded successfully");
        clearSelection();
        onDocumentChange();
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to upload document",
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewDocument = async () => {
    if (!latestDocument) return;
    try {
      setLoadingPreview(true);
      const response = await AthleteDocumentService.downloadDocument(
        latestDocument.document_id,
      );
      setPreviewDocUrl(
        window.URL.createObjectURL(
          new Blob([response.data], { type: latestDocument.file_type }),
        ),
      );
      setShowPreviewModal(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to preview document",
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreviewModal = () => {
    if (previewDocUrl) window.URL.revokeObjectURL(previewDocUrl);
    setPreviewDocUrl(null);
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

  const handleDelete = async (documentId: number) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await AthleteDocumentService.deleteDocument(documentId);
      toast.success("Document deleted successfully");
      onDocumentChange();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete document",
      );
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

  const expiryBadgeColor = (days: number) =>
    days < 0
      ? "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
      : days < 30
        ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
        : "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";

  const isImageFile = (ft: string) => ft.startsWith("image/");
  const isPdfFile = (ft: string) => ft === "application/pdf";

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                {documentType}
              </h3>
              {latestDocument && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last uploaded:{" "}
                  {new Date(latestDocument.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {latestDocument && (
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm ${getStatusColor(latestDocument.status)}`}
            >
              {getStatusIcon(latestDocument.status)}
              {latestDocument.status}
            </span>
          )}
        </div>

        {/* Current Document */}
        {latestDocument && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-gray-800 dark:text-white">
                  {latestDocument.file_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {latestDocument.file_size_formatted ||
                    `${(latestDocument.file_size / 1024).toFixed(2)} KB`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canViewFiles && !isAdmin && (
                  <>
                    <button
                      onClick={handlePreviewDocument}
                      disabled={loadingPreview}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {loadingPreview ? "Loading..." : "Preview"}
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(
                          latestDocument.document_id,
                          latestDocument.file_name,
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center gap-2 transition-all"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                    {canUpload && latestDocument.status !== "Approved" && (
                      <button
                        onClick={() => handleDelete(latestDocument.document_id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm flex items-center gap-2 transition-all"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {latestDocument.status === "Approved" &&
              latestDocument.valid_until && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                        Valid Until:
                      </p>
                      <p className="text-lg font-bold text-green-900 dark:text-green-200">
                        {new Date(
                          latestDocument.valid_until,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {latestDocument.days_until_expiry !== undefined && (
                      <div
                        className={`px-3 py-1 rounded-lg font-bold text-sm ${expiryBadgeColor(latestDocument.days_until_expiry)}`}
                      >
                        {latestDocument.days_until_expiry < 0
                          ? `Expired ${Math.abs(latestDocument.days_until_expiry)} days ago`
                          : `${latestDocument.days_until_expiry} days remaining`}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {latestDocument.rejection_reason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-lg">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  Rejection Reason:
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {latestDocument.rejection_reason}
                </p>
              </div>
            )}

            {latestDocument.notes && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Notes:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {latestDocument.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Form */}
        {canUpload &&
          (!latestDocument || latestDocument?.status === "Rejected") && (
            <div className="space-y-4">
              {latestDocument?.status === "Rejected" && (
                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-300 dark:border-amber-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <div>
                      <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">
                        Document Rejected — Re-upload Required
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-400">
                        Your previous document was rejected. Please upload a new
                        document that addresses the rejection reason above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-white dark:bg-white/5">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-500/20 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-500/30 transition-all"
                />
                {selectedFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                    {previewUrl && (
                      <div className="mt-4 border-2 border-gray-300 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-white/5">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Preview:
                        </p>
                        <img
                          src={previewUrl}
                          alt="Document preview"
                          className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg object-contain"
                        />
                      </div>
                    )}
                    {!selectedFile.type.startsWith("image/") && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
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
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Preview not available for{" "}
                          {selectedFile.type.includes("pdf")
                            ? "PDF"
                            : "document"}{" "}
                          files.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={clearSelection}
                      className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold flex items-center gap-1"
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
                      Clear selection
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20 transition-all"
                  rows={3}
                  placeholder="Add any relevant notes..."
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : latestDocument?.status === "Rejected" ? (
                  "Re-upload Document"
                ) : (
                  "Upload Document"
                )}
              </button>
            </div>
          )}

        {isAdmin && !canViewFiles && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border-2 border-yellow-200 dark:border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              ℹ️ As an administrator, you can only view the approval status of
              this document.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewDocUrl && latestDocument && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 dark:border-white/10">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {latestDocument.file_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {documentType}
                </p>
              </div>
              <button
                onClick={closePreviewModal}
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
              {isImageFile(latestDocument.file_type) ? (
                <img
                  src={previewDocUrl}
                  alt={latestDocument.file_name}
                  className="max-w-full max-h-full mx-auto object-contain"
                />
              ) : isPdfFile(latestDocument.file_type) ? (
                <iframe
                  src={previewDocUrl}
                  className="w-full h-full min-h-[600px]"
                  title={latestDocument.file_name}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 font-bold text-lg mb-2">
                    Preview not available
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    This file type cannot be previewed in the browser
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParentConsentUpload;
