import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";

interface MedicalRecordsUploadProps {
  athlete: AthleteColumns;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
  onDocumentChange: () => void;
}

const MedicalRecordsUpload = ({
  athlete,
  documents,
  canViewFiles,
  onDocumentChange,
}: MedicalRecordsUploadProps) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("Medical Record");
  const [notes, setNotes] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<AthleteDocumentColumns | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const canUpload = user?.role === "Athlete" || user?.role === "Coach";
  const isAdmin = user?.role === "Admin";
  const documentTypes = [
    "Medical Record",
    "Physical Exam",
    "Injury Report",
    "Medical Clearance",
  ];

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

  const handleCancel = () => {
    clearSelection();
    setDocumentType("Medical Record");
    setShowAddForm(false);
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
        handleCancel();
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

  const handlePreviewDocument = async (doc: AthleteDocumentColumns) => {
    try {
      setLoadingPreview(true);
      const response = await AthleteDocumentService.downloadDocument(
        doc.document_id,
      );
      setPreviewDocUrl(
        window.URL.createObjectURL(
          new Blob([response.data], { type: doc.file_type }),
        ),
      );
      setSelectedDocument(doc);
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

  const handleReuploadClick = (docType: string) => {
    setDocumentType(docType);
    setShowAddForm(true);
    setTimeout(() => {
      document
        .getElementById("upload-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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

  const isImageFile = (ft: string) => ft.startsWith("image/");
  const isPdfFile = (ft: string) => ft === "application/pdf";

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
          {canUpload && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Document
            </button>
          )}
        </div>

        {/* Upload Form */}
        {showAddForm && canUpload && (
          <div
            id="upload-form"
            className="mb-6 p-6 bg-pink-50 dark:bg-pink-500/10 rounded-xl border-2 border-pink-200 dark:border-pink-500/20"
          >
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Upload New Medical Document
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/20 transition-all"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t} className="dark:bg-[#1a1f2e]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Choose File
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl p-6 hover:border-pink-400 dark:hover:border-pink-500 transition-all bg-white dark:bg-white/5">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 dark:file:bg-pink-500/20 file:text-pink-700 dark:file:text-pink-300 hover:file:bg-pink-100 dark:hover:file:bg-pink-500/30 transition-all"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-500/20 transition-all"
                  rows={3}
                  placeholder="Add any relevant notes about this medical document..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
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
                  ) : (
                    "Upload Document"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
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
              Upload your medical certificates, physical exams, or injury
              reports
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
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.document_id}
                      className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all border-2 border-gray-200 dark:border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">
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

                      {doc.status === "Approved" && doc.valid_until && (
                        <div className="mt-2 p-2 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                                Valid Until:
                              </p>
                              <p className="text-sm font-bold text-green-900 dark:text-green-200">
                                {new Date(doc.valid_until).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            {doc.days_until_expiry !== undefined && (
                              <div
                                className={`px-2 py-1 rounded-lg font-bold text-xs ${expiryBadgeColor(doc.days_until_expiry)}`}
                              >
                                {doc.days_until_expiry < 0
                                  ? "Expired"
                                  : `${doc.days_until_expiry} days left`}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {doc.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/30 rounded-lg">
                          <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400">
                            {doc.rejection_reason}
                          </p>
                          {canUpload && (
                            <button
                              onClick={() =>
                                handleReuploadClick(doc.document_type)
                              }
                              className="mt-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold text-xs flex items-center gap-1 transition-all"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                              Re-upload this document type
                            </button>
                          )}
                        </div>
                      )}

                      {doc.notes && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-200 dark:border-blue-500/30 rounded-lg">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                            Notes:
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400">
                            {doc.notes}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        {canViewFiles && !isAdmin && (
                          <>
                            <button
                              onClick={() => handlePreviewDocument(doc)}
                              disabled={loadingPreview}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                              Preview
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(doc.document_id, doc.file_name)
                              }
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs flex items-center gap-1 transition-all"
                            >
                              <svg
                                className="w-3.5 h-3.5"
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
                            {canUpload && (
                              <button
                                onClick={() => handleDelete(doc.document_id)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-xs flex items-center gap-1 transition-all"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
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
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdmin && !canViewFiles && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-500/10 border-2 border-yellow-200 dark:border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              🔒 As an administrator, you cannot view medical documents to
              protect athlete privacy.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewDocUrl && selectedDocument && (
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
              {isImageFile(selectedDocument.file_type) ? (
                <img
                  src={previewDocUrl}
                  alt={selectedDocument.file_name}
                  className="max-w-full max-h-full mx-auto object-contain"
                />
              ) : isPdfFile(selectedDocument.file_type) ? (
                <iframe
                  src={previewDocUrl}
                  className="w-full h-full min-h-[600px]"
                  title={selectedDocument.file_name}
                />
              ) : (
                <div className="text-center py-12">
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

export default MedicalRecordsUpload;
