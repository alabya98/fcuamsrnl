import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import toast from "react-hot-toast";

interface SchoolIDUploadProps {
  athlete: AthleteColumns;
  documents: AthleteDocumentColumns[];
  canViewFiles: boolean;
  onDocumentChange: () => void;
}

const SchoolIDUpload = ({
  athlete,
  documents,
  onDocumentChange,
}: SchoolIDUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AthleteDocumentColumns | null>(
    null,
  );
  const [loadingPreview, setLoadingPreview] = useState(false);

  const schoolIDDocs = documents.filter((d) => d.document_type === "School ID");
  const frontDoc = schoolIDDocs.find(
    (d) =>
      d.file_name.toLowerCase().includes("front") ||
      d.notes?.toLowerCase().includes("front"),
  );
  const backDoc = schoolIDDocs.find(
    (d) =>
      d.file_name.toLowerCase().includes("back") ||
      d.notes?.toLowerCase().includes("back"),
  );

  const canUpload = user?.role === "Athlete" || user?.role === "Coach";
  const isAdmin = user?.role === "Admin";

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

  const bothSidesUploaded = frontDoc && backDoc;
  const frontRejected = frontDoc?.status === "Rejected";
  const backRejected = backDoc?.status === "Rejected";
  const anyRejected = frontRejected || backRejected;

  // Show upload form if not both uploaded, or if any side is rejected
  const showUploadForm = !bothSidesUploaded || anyRejected;

  // Determine which sides need uploading in the form:
  // - If neither side exists yet, show both
  // - If only front is rejected and back is approved, show only front
  // - If only back is rejected and front is approved, show only back
  // - If both are rejected, show both
  const needsFrontUpload = !frontDoc || frontRejected;
  const needsBackUpload = !backDoc || backRejected;

  // Button is disabled only if a needed side is missing its file
  const canSubmit =
    (!needsFrontUpload || frontFile !== null) &&
    (!needsBackUpload || backFile !== null);

  const handleImageSelect =
    (
      setter: (f: File | null) => void,
      previewSetter: (s: string | null) => void,
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
          toast.error("Please upload JPG or PNG image only");
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error("File size must be less than 10MB");
          return;
        }
        setter(file);
        const reader = new FileReader();
        reader.onloadend = () => previewSetter(reader.result as string);
        reader.readAsDataURL(file);
      }
    };

  const handleUpload = async () => {
    if (!canSubmit) {
      toast.error(
        needsFrontUpload && needsBackUpload
          ? "Please select both front and back images"
          : needsFrontUpload
            ? "Please select a front side image"
            : "Please select a back side image",
      );
      return;
    }

    try {
      setUploading(true);

      if (needsFrontUpload && frontFile) {
        await AthleteDocumentService.uploadDocument({
          athlete_id: athlete.athlete_id,
          document_type: "School ID",
          file: new File([frontFile], `School_ID_Front_${frontFile.name}`, {
            type: frontFile.type,
          }),
          notes: `Front side${notes ? ` - ${notes}` : ""}`,
        });
      }

      if (needsBackUpload && backFile) {
        await AthleteDocumentService.uploadDocument({
          athlete_id: athlete.athlete_id,
          document_type: "School ID",
          file: new File([backFile], `School_ID_Back_${backFile.name}`, {
            type: backFile.type,
          }),
          notes: `Back side${notes ? ` - ${notes}` : ""}`,
        });
      }

      const uploadedSides = [
        needsFrontUpload && frontFile ? "front" : null,
        needsBackUpload && backFile ? "back" : null,
      ]
        .filter(Boolean)
        .join(" and ");

      toast.success(`School ID uploaded successfully (${uploadedSides})`);
      setFrontFile(null);
      setBackFile(null);
      setFrontPreview(null);
      setBackPreview(null);
      setNotes("");
      onDocumentChange();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to upload documents",
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
      setPreviewDoc(doc);
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

  const renderDocCard = (doc: AthleteDocumentColumns, label: string) => (
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
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {doc.file_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {doc.file_size_formatted}
          </p>
        </div>
        {doc.valid_until && doc.status === "Approved" && (
          <div className="p-2 bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/30 rounded-lg">
            <p className="text-xs font-semibold text-green-800 dark:text-green-300">
              Valid Until:
            </p>
            <p className="text-sm font-bold text-green-900 dark:text-green-200">
              {new Date(doc.valid_until).toLocaleDateString()}
            </p>
          </div>
        )}
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
        <div className="flex gap-2">
          <button
            onClick={() => handlePreviewDocument(doc)}
            disabled={loadingPreview}
            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold text-xs transition-all disabled:opacity-50"
          >
            Preview
          </button>
          <button
            onClick={() => handleDownload(doc.document_id, doc.file_name)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-xs transition-all"
          >
            Download
          </button>
          {canUpload && doc.status !== "Approved" && (
            <button
              onClick={() => handleDelete(doc.document_id)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-xs transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderUploadSlot = (
    label: string,
    preview: string | null,
    file: File | null,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
  ) => (
    <div className="border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
      <h4 className="font-bold text-gray-800 dark:text-white mb-3">{label}</h4>
      {!preview ? (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={onChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-400 dark:border-white/20 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click to upload {label.toLowerCase()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              JPG or PNG, max 10MB
            </p>
          </div>
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt={`${label} preview`}
            className="w-full h-48 object-contain rounded-lg border-2 border-gray-300 dark:border-white/10"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg"
            title="Remove image"
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
          </button>
          {file && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      )}
    </div>
  );

  const getButtonLabel = () => {
    if (uploading) return null;
    if (needsFrontUpload && needsBackUpload)
      return "Upload School ID (Front & Back)";
    if (needsFrontUpload) return "Upload School ID (Front Side)";
    return "Upload School ID (Back Side)";
  };

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
                Upload both front and back sides
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

        {/* Existing docs */}
        {bothSidesUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {frontDoc && renderDocCard(frontDoc, "Front Side")}
            {backDoc && renderDocCard(backDoc, "Back Side")}
          </div>
        )}

        {/* Upload Form */}
        {canUpload && showUploadForm && (
          <div className="space-y-6">
            {anyRejected && (
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
                      School ID Rejected — Re-upload Required
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      {frontRejected && backRejected
                        ? "Both sides were rejected. Please upload new images for both sides."
                        : frontRejected
                          ? "The front side was rejected. Please upload a new front image."
                          : "The back side was rejected. Please upload a new back image."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Only render the slots that need uploading */}
            <div
              className={`grid grid-cols-1 ${needsFrontUpload && needsBackUpload ? "md:grid-cols-2" : ""} gap-6`}
            >
              {needsFrontUpload &&
                renderUploadSlot(
                  "Front Side",
                  frontPreview,
                  frontFile,
                  handleImageSelect(setFrontFile, setFrontPreview),
                  () => {
                    setFrontFile(null);
                    setFrontPreview(null);
                  },
                )}
              {needsBackUpload &&
                renderUploadSlot(
                  "Back Side",
                  backPreview,
                  backFile,
                  handleImageSelect(setBackFile, setBackPreview),
                  () => {
                    setBackFile(null);
                    setBackPreview(null);
                  },
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
                rows={2}
                placeholder="Add any relevant notes..."
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!canSubmit || uploading}
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
              ) : (
                getButtonLabel()
              )}
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border-2 border-yellow-200 dark:border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
              ℹ️ As an administrator, you can only view the approval status of
              this document.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewDocUrl && previewDoc && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
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
              <img
                src={previewDocUrl}
                alt={previewDoc.file_name}
                className="max-w-full max-h-full mx-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolIDUpload;
