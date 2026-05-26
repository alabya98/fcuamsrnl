import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import AcademicRecordService from "../../../services/AcademicRecordService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { CourseGrade } from "../../../interfaces/AcademicRecordInterface";

interface GradeUploadModalProps {
  athlete: AthleteColumns;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GradeUploadModal = ({
  athlete,
  isOpen,
  onClose,
  onSuccess,
}: GradeUploadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [semesterTerm, setSemesterTerm] = useState("");
  const [courses, setCourses] = useState<CourseGrade[]>([]);
  const [extractedText, setExtractedText] = useState("");
  const [ocrAccuracyWarning, setOcrAccuracyWarning] = useState(false);
  const submittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradeOptions: (number | string)[] = [
    1.0,
    1.25,
    1.5,
    1.75,
    2.0,
    2.25,
    2.5,
    2.75,
    3.0,
    "INC",
    "DRP",
  ];

  const gradeToPercentage: Record<number, number> = {
    1.0: 98,
    1.25: 94,
    1.5: 89,
    1.75: 86,
    2.0: 83,
    2.25: 80,
    2.5: 77,
    2.75: 74,
    3.0: 75,
  };

  if (!isOpen) return null;

  // ✅ FIX: Use toFixed(2) for numeric grades so the select value always
  //    matches the option value exactly. Previously String(1.0) = "1"
  //    which failed to match option value "1.0", causing the select to
  //    silently show the wrong grade or reset to the first option —
  //    meaning what the user saw in the preview differed from what was sent.
  const getGradeSelectValue = (grade: number | "INC" | "DRP"): string => {
    if (grade === "INC" || grade === "DRP") return grade;
    return typeof grade === "number"
      ? grade.toFixed(2)
      : parseFloat(grade as string).toFixed(2);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    await processImageWithOCR(file);
  };

  const processImageWithOCR = async (file: File) => {
    try {
      setOcrProcessing(true);
      setExtractedText("");
      setOcrAccuracyWarning(true);
      const worker = await createWorker("eng", 1, {
        logger: (m) => console.log(m),
      });
      await worker.setParameters({
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.() -,/",
      });
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();
      setExtractedText(text);
      const extractedCourses = extractCoursesFromText(text);
      if (extractedCourses.length > 0) {
        setCourses([
          ...extractedCourses,
          ...Array(3)
            .fill(null)
            .map(() => ({
              course_code: "",
              course_name: "",
              grade: 1.0 as number | "INC" | "DRP",
              credits: 3,
            })),
        ]);
      } else {
        alert(
          "Could not automatically extract courses from the image. Please enter them manually.",
        );
        setCourses(
          Array(10)
            .fill(null)
            .map(() => ({
              course_code: "",
              course_name: "",
              grade: 1.0 as number | "INC" | "DRP",
              credits: 3,
            })),
        );
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      alert("OCR processing failed. Please enter grades manually.");
      setCourses(
        Array(10)
          .fill(null)
          .map(() => ({
            course_code: "",
            course_name: "",
            grade: 1.0 as number | "INC" | "DRP",
            credits: 3,
          })),
      );
    } finally {
      setOcrProcessing(false);
    }
  };

  const parseGradeValue = (raw: string): number | "INC" | "DRP" | null => {
    const t = raw.trim().toUpperCase();
    if (t === "INC" || t === "INCOMPLETE") return "INC";
    if (t === "DRP" || t === "DROP" || t === "DROPPED") return "DRP";
    if (t === "P" || t === "PASSED") return null;
    let fixed = t;
    if (/^\d{3}$/.test(fixed)) fixed = fixed[0] + "." + fixed.substring(1);
    else if (/^\d{2}$/.test(fixed)) fixed = fixed[0] + "." + fixed[1] + "0";
    const num = parseFloat(fixed);
    if (isNaN(num)) return null;
    const validGrades = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
    const closest = validGrades.reduce((prev, curr) =>
      Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev,
    );
    if (Math.abs(closest - num) <= 0.13) return closest;
    if (num >= 1.0 && num <= 3.0) return num;
    return null;
  };

  const extractCoursesFromText = (text: string): CourseGrade[] => {
    const extractedCourses: CourseGrade[] = [];
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 3);
    const semesterPatterns = [
      /([A-Z]+\s*[-–]\s*SY\s*\d{4}[-–]\d{4}\s+\d+(?:ST|ND|RD|TH)\s+SEMESTER)/i,
      /(SY\s*\d{4}[-–]\d{4}\s+\d+(?:ST|ND|RD|TH)\s+SEMESTER)/i,
      /(\d{4}[-–]\d{4}\s+(?:FIRST|SECOND|1ST|2ND)\s+SEMESTER)/i,
    ];
    for (const line of lines) {
      for (const pat of semesterPatterns) {
        const m = line.match(pat);
        if (m && !semesterTerm) {
          setSemesterTerm(m[1].trim());
          break;
        }
      }
    }
    const skipPatterns = [
      /semester\s*credits/i,
      /course\s+description/i,
      /^credits$/i,
      /^units$/i,
      /^grade$/i,
      /^teacher$/i,
      /^\d{4}-\d{4}-\d+$/,
      /^(FIRST|SECOND|THIRD|FOURTH)\s+YEAR/i,
      /^BSIT\s*-/i,
      /^SY\s+\d{4}/i,
      /^completion$/i,
    ];
    const shouldSkip = (line: string) =>
      skipPatterns.some((p) => p.test(line.trim()));
    for (const line of lines) {
      if (shouldSkip(line)) continue;
      const codeMatch = line.match(
        /^([A-Z][A-Za-z]*\s*\d*(?:\s*\([^)]*\))?)\s{1,}/i,
      );
      if (!codeMatch) continue;
      const rawCode = codeMatch[1].trim().toUpperCase().replace(/\s+/g, " ");
      if (!/[A-Z]/.test(rawCode) || rawCode.length > 30) continue;
      const afterCode = line.slice(codeMatch[0].length).trim();
      const afterNoTerm = afterCode
        .replace(/\s+\d{4}[-–]\d{4}[-–]\d\s*$/, "")
        .trim();
      const tokens = afterNoTerm
        .split(/\s{2,}/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      if (tokens.length === 0) continue;
      let gradeTokenIdx = -1,
        gradeValue: number | "INC" | "DRP" | null = null,
        unitsValue = 3;
      for (let i = tokens.length - 1; i >= 0; i--) {
        const tok = tokens[i];
        if (/^[A-Z][A-Z\s]+,\s+[A-Z]/.test(tok)) continue;
        if (/^\d$/.test(tok) && gradeTokenIdx === -1) continue;
        const parsed = parseGradeValue(tok);
        if (parsed !== null || tok.toUpperCase() === "P") {
          gradeValue = parsed;
          gradeTokenIdx = i;
          break;
        }
      }
      if (gradeTokenIdx !== -1 && gradeTokenIdx + 1 < tokens.length) {
        const next = tokens[gradeTokenIdx + 1];
        if (/^\d$/.test(next)) {
          const u = parseInt(next);
          if (u >= 0 && u <= 6) unitsValue = u;
        }
      }
      if (gradeTokenIdx === -1) {
        if (tokens.length >= 2 && /^\d$/.test(tokens[tokens.length - 2]))
          unitsValue = parseInt(tokens[tokens.length - 2]);
        else if (tokens.length >= 1 && /^\d$/.test(tokens[tokens.length - 1]))
          unitsValue = parseInt(tokens[tokens.length - 1]);
      }
      const courseNameTokens =
        gradeTokenIdx > 0
          ? tokens.slice(0, gradeTokenIdx)
          : gradeTokenIdx === 0
            ? []
            : tokens;
      const courseName = courseNameTokens.join(" ").trim() || rawCode;
      const finalGrade: number | "INC" | "DRP" =
        gradeValue === null ? 1.0 : gradeValue;
      if (rawCode.length >= 2 && courseName.length >= 1) {
        extractedCourses.push({
          course_code: rawCode,
          course_name: courseName,
          grade: finalGrade,
          credits: unitsValue,
        });
      }
    }
    return extractedCourses.filter(
      (course, index, self) =>
        index === self.findIndex((c) => c.course_code === course.course_code),
    );
  };

  const addCourse = () =>
    setCourses([
      ...courses,
      { course_code: "", course_name: "", grade: 1.0, credits: 3 },
    ]);

  const removeCourse = (index: number) => {
    if (courses.length <= 1) {
      alert("You must have at least one course.");
      return;
    }
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (
    index: number,
    field: keyof CourseGrade,
    value: string | number,
  ) => {
    const updated = [...courses];
    updated[index] = { ...updated[index], [field]: value };
    setCourses(updated);
  };

  const calculatePreview = () => {
    let totalPercentage = 0,
      totalUnits = 0,
      failedCourses = 0,
      totalGradePoints = 0;

    courses.forEach((course) => {
      // ✅ FIX: Match the same filter used in handleSubmit so the preview
      //    always reflects exactly what will be sent to the backend.
      if (
        course.course_code.trim() &&
        course.course_name.trim() &&
        course.credits > 0
      ) {
        if (course.grade === "INC" || course.grade === "DRP") {
          failedCourses++;
        } else {
          const gradeValue =
            typeof course.grade === "number"
              ? course.grade
              : parseFloat(course.grade as string);
          if (!isNaN(gradeValue) && gradeValue >= 1.0 && gradeValue <= 3.0) {
            totalPercentage +=
              (gradeToPercentage[gradeValue] ?? 75) * course.credits;
            totalGradePoints += gradeValue * course.credits;
            totalUnits += course.credits;
          }
        }
      }
    });

    const gwa = totalUnits > 0 ? totalGradePoints / totalUnits : 0;
    const avgPercentage = totalUnits > 0 ? totalPercentage / totalUnits : 0;

    // ✅ FIX: Mirror the backend rule — if any course is INC/DRP, percentage
    //    drops to 0 so the preview status matches what the backend will save.
    const effectivePercentage = failedCourses > 0 ? 0 : avgPercentage;

    return {
      gwa: gwa.toFixed(2),
      percentage: effectivePercentage.toFixed(2),
      status:
        effectivePercentage >= 75 && failedCourses === 0
          ? "Eligible"
          : "Under Review",
      totalUnits,
      failedCourses,
    };
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;

    if (!selectedImage) {
      alert("Please upload a grade image");
      return;
    }
    if (!semesterTerm.trim()) {
      alert("Please enter semester/term");
      return;
    }
    const validCourses = courses.filter(
      (c) => c.course_code.trim() && c.course_name.trim() && c.credits >= 0,
    );
    if (validCourses.length === 0) {
      alert("Please add at least one course with complete information");
      return;
    }
    const processedCourses = validCourses.map((course) => ({
      course_code: course.course_code.trim(),
      course_name: course.course_name.trim(),
      grade: course.grade,
      credits:
        typeof course.credits === "number"
          ? course.credits
          : parseInt(String(course.credits)),
    }));
    for (let i = 0; i < processedCourses.length; i++) {
      const c = processedCourses[i];
      if (!c.course_code || c.course_code.length < 1) {
        alert(`Course ${i + 1}: Course code is required`);
        return;
      }
      if (!c.course_name || c.course_name.length < 1) {
        alert(`Course ${i + 1}: Course name is required`);
        return;
      }
      if (c.grade !== "INC" && c.grade !== "DRP") {
        const numericGrade =
          typeof c.grade === "number" ? c.grade : parseFloat(c.grade as string);
        if (isNaN(numericGrade)) {
          alert(`Course ${i + 1} (${c.course_code}): Invalid grade value`);
          return;
        }
        if (numericGrade < 1.0 || numericGrade > 3.0) {
          alert(
            `Course ${i + 1} (${c.course_code}): Grade must be between 1.0-3.0`,
          );
          return;
        }
      }
      if (isNaN(c.credits) || c.credits < 0 || c.credits > 6) {
        alert(
          `Course ${i + 1} (${c.course_code}): Credits must be between 0-6`,
        );
        return;
      }
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("athlete_id", String(athlete.athlete_id));
      formData.append("semester_term", semesterTerm.trim());
      formData.append("grade_image", selectedImage);
      formData.append("courses", JSON.stringify(processedCourses));

      const res = await AcademicRecordService.uploadGrades(formData);

      if (res.status === 200) {
        alert(res.data.message || "Grades uploaded successfully!");
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      let errorMessage = "Failed to upload grades";
      if (error.response?.data?.message)
        errorMessage = error.response.data.message;
      else if (error.response?.data?.errors)
        errorMessage = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
      else if (error.response?.data?.error)
        errorMessage = error.response.data.error;
      else if (error.message) errorMessage = error.message;

      alert(`Upload failed:\n\n${errorMessage}`);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleClose = () => {
    submittingRef.current = false;
    setSelectedImage(null);
    setImagePreview(null);
    setSemesterTerm("");
    setCourses([]);
    setExtractedText("");
    setOcrAccuracyWarning(false);
    setOcrProcessing(false);
    setLoading(false);
    onClose();
  };

  const preview = courses.length > 0 ? calculatePreview() : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl dark:shadow-black/50 max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg
                className="w-7 h-7"
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
              Upload Academic Grades
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
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
        </div>

        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-2 border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
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
              📋 How to Upload Your Grades
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-7">
              <li>
                • Take a <strong>clear screenshot</strong> of your FilCIS grade
                portal
              </li>
              <li>
                • System will <strong>automatically extract</strong> course
                codes, names, grades, and units
              </li>
              <li>
                •{" "}
                <strong className="text-red-600 dark:text-red-400">
                  Always review and correct
                </strong>{" "}
                extracted information (OCR may have errors)
              </li>
              <li>
                • Grades: <strong>1.0 to 3.0</strong> = Passing
              </li>
              <li>
                • INC/DRP = Failed &nbsp;|&nbsp; "P" (Passed) defaults to 1.0 —
                please correct manually if needed
              </li>
            </ul>
          </div>

          {/* Semester/Term */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Semester/Term <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={semesterTerm}
              onChange={(e) => setSemesterTerm(e.target.value)}
              placeholder="e.g., BSIT - SY 2024-2025 1ST SEMESTER"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-500 font-medium bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Grade Screenshot <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-gray-300 dark:border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all"
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg"
                  />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    Click to upload FilCIS grade screenshot
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    PNG, JPG • Clear image = Better accuracy
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* OCR Processing */}
          {ocrProcessing && (
            <div className="bg-yellow-50 dark:bg-yellow-500/10 border-2 border-yellow-300 dark:border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 dark:border-yellow-400"></div>
                <div>
                  <p className="font-bold text-yellow-800 dark:text-yellow-300">
                    🔍 Processing image with OCR...
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Extracting grades automatically...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OCR Accuracy Warning */}
          {ocrAccuracyWarning && !ocrProcessing && courses.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-400 dark:border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0"
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
                  <p className="font-bold text-amber-900 dark:text-amber-300">
                    ⚠️ OCR Extracted{" "}
                    {courses.filter((c) => c.course_code.trim()).length} Courses
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                    <strong>Please verify all information is correct!</strong>{" "}
                    OCR may misread decimal points (e.g., "1.75" as "175").
                    Courses showing "P" grade default to 1.0 — correct if
                    needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OCR Debug Text */}
          {extractedText && !ocrProcessing && (
            <details className="bg-gray-50 dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4">
              <summary className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
                📝 View OCR Text (Debug)
              </summary>
              <pre className="text-xs text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-wrap bg-white dark:bg-[#252b3b] p-4 rounded-lg border border-gray-200 dark:border-white/10 max-h-64 overflow-y-auto">
                {extractedText}
              </pre>
            </details>
          )}

          {/* Courses List */}
          {courses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  📚 Courses (
                  {courses.filter((c) => c.course_code.trim()).length}/
                  {courses.length})
                </h3>
                <button
                  onClick={addCourse}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-sm flex items-center gap-2"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add
                </button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {courses.map((course: CourseGrade, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-white/5 dark:to-blue-500/10 border-2 border-gray-200 dark:border-white/10 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-black/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                            Code *
                          </label>
                          <input
                            type="text"
                            value={course.course_code}
                            onChange={(e) =>
                              updateCourse(
                                index,
                                "course_code",
                                e.target.value.toUpperCase(),
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-white/10 rounded-lg text-sm font-semibold focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200"
                            placeholder="GE 6"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                            Course Name *
                          </label>
                          <input
                            type="text"
                            value={course.course_name}
                            onChange={(e) =>
                              updateCourse(index, "course_name", e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-white/10 rounded-lg text-sm font-medium focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200"
                            placeholder="Art Appreciation"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                            Grade *
                          </label>
                          {/* ✅ FIX: option value uses toFixed(2) to match
                               getGradeSelectValue output. Previously
                               String(1.0) = "1" ≠ option value "1.0",
                               causing the select to silently pick the wrong
                               grade after OCR sets a numeric value. */}
                          <select
                            value={getGradeSelectValue(course.grade)}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCourse(
                                index,
                                "grade",
                                val === "INC" || val === "DRP"
                                  ? val
                                  : parseFloat(val),
                              );
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-white/10 rounded-lg text-sm font-bold focus:border-blue-500 focus:outline-none bg-white dark:bg-[#1a1f2e] text-gray-800 dark:text-gray-200"
                          >
                            {gradeOptions.map((g) => (
                              <option
                                key={String(g)}
                                value={typeof g === "number" ? g.toFixed(2) : g}
                                className="dark:bg-[#1a1f2e]"
                              >
                                {typeof g === "number" ? g.toFixed(2) : g}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                            Units *
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="6"
                            value={course.credits}
                            onChange={(e) =>
                              updateCourse(
                                index,
                                "credits",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-300 dark:border-white/10 rounded-lg text-sm font-bold focus:border-blue-500 focus:outline-none bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeCourse(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg mt-6 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grade Preview */}
          {preview && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border-2 border-indigo-300 dark:border-indigo-500/20 rounded-xl p-6">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 text-lg">
                📊 Grade Preview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "GWA",
                    value: preview.gwa,
                    color: "text-indigo-900 dark:text-indigo-200",
                    labelColor: "text-indigo-600 dark:text-indigo-400",
                  },
                  {
                    label: "Percentage",
                    value: `${preview.percentage}%`,
                    color: "text-purple-900 dark:text-purple-200",
                    labelColor: "text-purple-600 dark:text-purple-400",
                  },
                  {
                    label: "Total Units",
                    value: preview.totalUnits,
                    color: "text-blue-900 dark:text-blue-200",
                    labelColor: "text-blue-600 dark:text-blue-400",
                  },
                ].map(({ label, value, color, labelColor }) => (
                  <div
                    key={label}
                    className="text-center bg-white dark:bg-[#1a1f2e] p-5 rounded-xl shadow-md dark:shadow-black/20"
                  >
                    <p className={`text-sm font-semibold ${labelColor} mb-2`}>
                      {label}
                    </p>
                    <p className={`text-4xl font-extrabold ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
                <div className="text-center bg-white dark:bg-[#1a1f2e] p-5 rounded-xl shadow-md dark:shadow-black/20">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                    Status
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                      preview.status === "Eligible"
                        ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                    }`}
                  >
                    {preview.status}
                  </span>
                </div>
              </div>
              {preview.failedCourses > 0 && (
                <div className="mt-4 bg-red-100 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30 rounded-lg p-4">
                  <p className="text-sm font-bold text-red-800 dark:text-red-300">
                    ⚠️ {preview.failedCourses} failed course
                    {preview.failedCourses > 1 ? "s" : ""}. Coach will review.
                  </p>
                </div>
              )}
              {parseFloat(preview.percentage) < 75 &&
                preview.failedCourses === 0 && (
                  <div className="mt-4 bg-yellow-100 dark:bg-yellow-500/10 border-2 border-yellow-300 dark:border-yellow-500/30 rounded-lg p-4">
                    <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                      ⚠️ Below 75%. Status: Under Review (14-day grace period)
                    </p>
                  </div>
                )}
              {preview.status === "Eligible" && (
                <div className="mt-4 bg-green-100 dark:bg-green-500/10 border-2 border-green-300 dark:border-green-500/30 rounded-lg p-4">
                  <p className="text-sm font-bold text-green-800 dark:text-green-300">
                    ✅ You meet academic eligibility requirements!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-[#1e2433] px-6 py-4 rounded-b-2xl border-t-2 border-gray-200 dark:border-white/10 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-400 dark:hover:bg-white/15 font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !selectedImage ||
              !semesterTerm ||
              courses.filter((c) => c.course_code.trim()).length === 0
            }
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Upload Grades
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeUploadModal;
