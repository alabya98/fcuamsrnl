import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteDocumentService from "../../../services/AthleteDocumentService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AthleteDocumentColumns } from "../../../interfaces/AthleteDocumentInterface";
import ParentConsentUpload from "./ParentConsentUpload";
import MedicalRecordsUpload from "./MedicalRecordsUpload";
import SchoolIDUpload from "./SchoolIDUpload";
import ParentConsentView from "./ParentConsentView";
import MedicalRecordsView from "./MedicalRecordsView";
import SchoolIDView from "./SchoolIDView";

interface DocumentUploadSectionProps {
  athlete: AthleteColumns;
  onDocumentUpdated: () => void;
}

const DocumentUploadSection = ({
  athlete,
  onDocumentUpdated,
}: DocumentUploadSectionProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<AthleteDocumentColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [canViewFiles, setCanViewFiles] = useState(true);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await AthleteDocumentService.getAthleteDocuments(
        athlete.athlete_id,
      );
      if (res.status === 200) {
        setDocuments(res.data.documents);
        setCanViewFiles(res.data.can_view_files);
      }
    } catch (error: any) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [athlete.athlete_id]);

  const handleDocumentChange = () => {
    loadDocuments();
    onDocumentUpdated();
  };

  const parentConsentDocs = documents.filter(
    (d) => d.document_type === "Parent Consent",
  );
  const schoolIDDocs = documents.filter((d) => d.document_type === "School ID");
  const medicalDocs = documents.filter((d) =>
    [
      "Medical Record",
      "Physical Exam",
      "Injury Report",
      "Medical Clearance",
    ].includes(d.document_type),
  );

  const isOwner = user?.role === "Athlete" && athlete.user_id === user.user_id;
  const isCoach = user?.role === "Coach";

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Loading documents...
          </p>
        </div>
      </div>
    );
  }

  // Athlete (owner) — upload interface
  if (isOwner) {
    return (
      <div className="space-y-6">
        <ParentConsentUpload
          athlete={athlete}
          documents={parentConsentDocs}
          canViewFiles={canViewFiles}
          onDocumentChange={handleDocumentChange}
        />
        <SchoolIDUpload
          athlete={athlete}
          documents={schoolIDDocs}
          canViewFiles={canViewFiles}
          onDocumentChange={handleDocumentChange}
        />
        <MedicalRecordsUpload
          athlete={athlete}
          documents={medicalDocs}
          canViewFiles={canViewFiles}
          onDocumentChange={handleDocumentChange}
        />
      </div>
    );
  }

  // Coach / Admin — view-only interface
  return (
    <div className="space-y-6">
      {isCoach && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-2 border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0"
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
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              You are viewing {athlete.first_name}'s documents. You can download
              and review but cannot upload on their behalf.
            </p>
          </div>
        </div>
      )}

      <ParentConsentView
        athlete={athlete}
        documents={parentConsentDocs}
        canViewFiles={canViewFiles}
        documentType="Parent Consent"
      />
      <SchoolIDView
        athlete={athlete}
        documents={schoolIDDocs}
        canViewFiles={canViewFiles}
      />
      <MedicalRecordsView
        athlete={athlete}
        documents={medicalDocs}
        canViewFiles={canViewFiles}
      />
    </div>
  );
};

export default DocumentUploadSection;
