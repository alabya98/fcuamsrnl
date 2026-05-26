<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AthleteDocument;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AthleteDocumentController extends Controller
{
    /**
     * Get all documents for a specific athlete
     */
    public function getAthleteDocuments($athleteId)
    {
        try {
            $user = Auth::user();

            $athlete = Athlete::where('athlete_id', $athleteId)
                ->where('is_deleted', false)
                ->first();

            if (!$athlete) {
                Log::warning('Athlete not found', ['athlete_id' => $athleteId]);
                return response()->json(['message' => 'Athlete not found'], 404);
            }

            Log::info('Document access attempt', [
                'user_id'          => $user->user_id,
                'user_role'        => $user->role,
                'athlete_id'       => $athleteId,
                'athlete_user_id'  => $athlete->user_id,
                'athlete_coach_id' => $athlete->coach_id
            ]);

            if ($user->role === 'Athlete') {
                if ($athlete->user_id !== $user->user_id) {
                    Log::warning('Athlete unauthorized access attempt', [
                        'user_id'         => $user->user_id,
                        'athlete_user_id' => $athlete->user_id
                    ]);
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Coach') {
                $coachId = $this->getCoachId($user->user_id);

                Log::info('Coach authorization check', [
                    'coach_id_from_user' => $coachId,
                    'athlete_coach_id'   => $athlete->coach_id,
                    'match'              => $coachId === $athlete->coach_id
                ]);

                if ($athlete->coach_id !== $coachId) {
                    Log::warning('Coach unauthorized access attempt', [
                        'coach_id'         => $coachId,
                        'athlete_coach_id' => $athlete->coach_id
                    ]);
                    return response()->json(['message' => 'Unauthorized - This athlete is not assigned to you'], 403);
                }
            }

            $documents = AthleteDocument::where('athlete_id', $athleteId)
                ->where('is_deleted', false)
                ->with(['reviewer'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($doc) use ($user) {
                    $data = [
                        'document_id'        => $doc->document_id,
                        'document_type'      => $doc->document_type,
                        'status'             => $doc->status,
                        'uploaded_at'        => $doc->created_at,
                        'reviewed_at'        => $doc->reviewed_at,
                        'rejection_reason'   => $doc->rejection_reason,
                        'file_name'          => $doc->file_name,
                        'file_size'          => $doc->file_size,
                        'file_size_formatted'=> $doc->file_size_formatted,
                        'file_type'          => $doc->file_type,
                        'valid_until'        => $doc->valid_until,
                        'days_until_expiry'  => $doc->days_until_expiry,
                        'notes'              => $doc->notes,
                        'is_visible_to_admin'=> $doc->is_visible_to_admin,
                        'created_at'         => $doc->created_at,
                        'updated_at'         => $doc->updated_at,
                        'reviewer'           => $doc->reviewer,
                    ];

                    return $data;
                });

            Log::info('Documents retrieved successfully', [
                'count'      => count($documents),
                'user_role'  => $user->role,
                'athlete_id' => $athleteId
            ]);

            // All roles (Admin, Coach, Athlete) can view/preview files
            return response()->json([
                'documents'      => $documents,
                'can_view_files' => true
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching athlete documents:', [
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'athlete_id' => $athleteId
            ]);

            return response()->json([
                'message' => 'Failed to fetch documents',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload a new document
     */
    public function uploadDocument(Request $request)
    {
        try {
            Log::info('Document upload attempt', [
                'athlete_id'    => $request->input('athlete_id'),
                'document_type' => $request->input('document_type'),
                'has_file'      => $request->hasFile('file')
            ]);

            $validated = $request->validate([
                'athlete_id'    => ['required', 'exists:tbl_athletes,athlete_id'],
                'document_type' => ['required', 'string', 'max:100'],
                'file'          => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
                'notes'         => ['nullable', 'string', 'max:1000']
            ]);

            $allowedTypes = [
                'Parent Consent',
                'Medical Record',
                'School ID',
                'Physical Exam',
                'Injury Report',
                'Medical Clearance'
            ];

            if (!in_array($validated['document_type'], $allowedTypes)) {
                Log::warning('Invalid document type', [
                    'provided_type' => $validated['document_type'],
                    'allowed_types' => $allowedTypes
                ]);
                return response()->json([
                    'message'       => 'Invalid document type',
                    'allowed_types' => $allowedTypes
                ], 422);
            }

            $user    = Auth::user();
            $athlete = Athlete::findOrFail($validated['athlete_id']);

            if ($user->role === 'Athlete' && $athlete->user_id !== $user->user_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($user->role === 'Coach' && $athlete->coach_id !== $this->getCoachId($user->user_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($user->role === 'Admin') {
                return response()->json(['message' => 'Admins cannot upload documents'], 403);
            }

            $file         = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $extension    = $file->getClientOriginalExtension();

            $fileName = $validated['athlete_id'] . '_' .
                Str::slug($validated['document_type']) . '_' .
                time() . '_' .
                Str::random(8) . '.' . $extension;

            $filePath = $file->storeAs(
                'athlete_documents/' . $validated['athlete_id'],
                $fileName,
                'local'
            );

            if (!$filePath) {
                Log::error('File storage failed');
                return response()->json(['message' => 'Failed to store file'], 500);
            }

            $isVisibleToAdmin = in_array($validated['document_type'], ['Parent Consent', 'School ID']);

            // For School ID, only soft-delete the rejected document that matches
            // the same side (front/back) being re-uploaded, so an approved side
            // is never wiped when only the other side is rejected.
            if ($validated['document_type'] === 'School ID') {
                $notes = $validated['notes'] ?? '';

                // Determine which side this upload is for based on the notes field
                // (the frontend always prefixes notes with "Front side" or "Back side")
                if (stripos($notes, 'front') !== false) {
                    $sideKeyword = 'front';
                } elseif (stripos($notes, 'back') !== false) {
                    $sideKeyword = 'back';
                } else {
                    $sideKeyword = null;
                }

                if ($sideKeyword !== null) {
                    // Only delete the rejected doc for this specific side
                    $rejectedDocs = AthleteDocument::where('athlete_id', $validated['athlete_id'])
                        ->where('document_type', 'School ID')
                        ->where('status', 'Rejected')
                        ->where('is_deleted', false)
                        ->get()
                        ->filter(function ($doc) use ($sideKeyword) {
                            return stripos($doc->file_name, $sideKeyword) !== false
                                || stripos($doc->notes ?? '', $sideKeyword) !== false;
                        });
                } else {
                    // Fallback: delete all rejected School ID docs (original behaviour)
                    $rejectedDocs = AthleteDocument::where('athlete_id', $validated['athlete_id'])
                        ->where('document_type', 'School ID')
                        ->where('status', 'Rejected')
                        ->where('is_deleted', false)
                        ->get();
                }
            } else {
                // For all other document types, delete all rejected docs of that type
                $rejectedDocs = AthleteDocument::where('athlete_id', $validated['athlete_id'])
                    ->where('document_type', $validated['document_type'])
                    ->where('status', 'Rejected')
                    ->where('is_deleted', false)
                    ->get();
            }

            foreach ($rejectedDocs as $rejectedDoc) {
                $rejectedDoc->update(['is_deleted' => true]);

                Log::info('Rejected document auto-deleted due to re-upload', [
                    'document_id'   => $rejectedDoc->document_id,
                    'document_type' => $validated['document_type'],
                    'athlete_id'    => $validated['athlete_id']
                ]);
            }

            $document = AthleteDocument::create([
                'athlete_id'          => $validated['athlete_id'],
                'document_type'       => $validated['document_type'],
                'file_name'           => $originalName,
                'file_path'           => $filePath,
                'file_type'           => $file->getMimeType(),
                'file_size'           => $file->getSize(),
                'status'              => 'Pending Review',
                'notes'               => $validated['notes'] ?? null,
                'is_visible_to_admin' => $isVisibleToAdmin
            ]);

            $this->updateAthleteDocumentStatus($validated['athlete_id']);
            $this->updateAthleteUploadStatus($validated['athlete_id'], $validated['document_type']);

            Log::info('Document uploaded successfully', [
                'document_id'   => $document->document_id,
                'athlete_id'    => $validated['athlete_id'],
                'document_type' => $validated['document_type']
            ]);

            return response()->json([
                'message'  => 'Document uploaded successfully',
                'document' => $document->load('reviewer')
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Document upload failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'line'  => $e->getLine(),
                'file'  => $e->getFile()
            ]);

            return response()->json([
                'message' => 'Failed to upload document',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine()
            ], 500);
        }
    }

    /**
     * Download/View a document
     */
    public function downloadDocument($documentId)
    {
        try {
            $user = Auth::user();

            $document = AthleteDocument::where('document_id', $documentId)
                ->where('is_deleted', false)
                ->with('athlete')
                ->firstOrFail();

            if ($user->role === 'Athlete') {
                if ($document->athlete->user_id !== $user->user_id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Coach') {
                if ($document->athlete->coach_id !== $this->getCoachId($user->user_id)) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Admin') {
                // Admins can view Parent Consent and School ID images.
                // Medical records remain restricted for privacy.
                $medicalTypes = ['Medical Record', 'Physical Exam', 'Injury Report', 'Medical Clearance'];
                if (in_array($document->document_type, $medicalTypes)) {
                    return response()->json([
                        'message' => 'Access denied. This document contains private medical information.'
                    ], 403);
                }
            }

            if (!Storage::disk('local')->exists($document->file_path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            $filePath = Storage::disk('local')->path($document->file_path);

            return response()->download($filePath, $document->file_name, [
                'Content-Type'        => $document->file_type,
                'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
            ]);
        } catch (\Exception $e) {
            Log::error('Document download failed:', [
                'error'       => $e->getMessage(),
                'document_id' => $documentId
            ]);

            return response()->json([
                'message' => 'Failed to download document',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update document status (Approve/Reject)
     */
    public function updateDocumentStatus(Request $request, $documentId)
    {
        try {
            $user = Auth::user();

            if (!in_array($user->role, ['Coach', 'Admin'])) {
                return response()->json(['message' => 'Only coaches or admins can review documents'], 403);
            }

            $validated = $request->validate([
                'status'           => ['required', 'in:Approved,Rejected'],
                'rejection_reason' => ['required_if:status,Rejected', 'nullable', 'string', 'max:500'],
                'valid_until'      => ['nullable', 'date', 'after:today']
            ]);

            $document = AthleteDocument::where('document_id', $documentId)
                ->where('is_deleted', false)
                ->with('athlete')
                ->firstOrFail();

            // Coaches can only review athletes assigned to them
            if ($user->role === 'Coach') {
                $coachId = $this->getCoachId($user->user_id);
                if ($document->athlete->coach_id !== $coachId) {
                    return response()->json(['message' => 'Unauthorized - This athlete is not assigned to you'], 403);
                }
            }

            $validUntil = ($validated['status'] === 'Approved')
                ? ($validated['valid_until'] ?? null)
                : null;

            DB::table('tbl_athlete_documents')
                ->where('document_id', $documentId)
                ->update([
                    'status'           => $validated['status'],
                    'rejection_reason' => $validated['rejection_reason'] ?? null,
                    'reviewed_by'      => $user->user_id,
                    'reviewed_at'      => now(),
                    'valid_until'      => $validUntil,
                    'updated_at'       => now(),
                ]);

            $this->updateAthleteApprovalStatus(
                $document->athlete_id,
                $document->document_type,
                $validated['status']
            );

            Log::info('Document status updated', [
                'document_id' => $documentId,
                'status'      => $validated['status'],
                'reviewed_by' => $user->user_id,
                'valid_until' => $validUntil
            ]);

            $fresh = AthleteDocument::with(['reviewer', 'athlete'])->find($documentId);

            return response()->json([
                'message'  => 'Document status updated successfully',
                'document' => $fresh
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Document status update failed:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to update document status',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function deleteDocument($documentId)
    {
        try {
            $user = Auth::user();

            $document = AthleteDocument::where('document_id', $documentId)
                ->where('is_deleted', false)
                ->with('athlete')
                ->firstOrFail();

            if ($user->role === 'Athlete') {
                if ($document->athlete->user_id !== $user->user_id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'Coach') {
                if ($document->athlete->coach_id !== $this->getCoachId($user->user_id)) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            }

            $document->update(['is_deleted' => true]);
            $this->updateAthleteDocumentStatus($document->athlete_id);

            Log::info('Document deleted', [
                'document_id' => $documentId,
                'deleted_by'  => $user->user_id
            ]);

            return response()->json([
                'message' => 'Document deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Document deletion failed:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to delete document',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private function getCoachId($userId)
    {
        $coach = \App\Models\Coach::where('user_id', $userId)
            ->where('is_deleted', false)
            ->first();

        return $coach ? $coach->coach_id : null;
    }

    private function updateAthleteDocumentStatus($athleteId)
    {
        $hasParentConsent = AthleteDocument::where('athlete_id', $athleteId)
            ->where('document_type', 'Parent Consent')
            ->where('is_deleted', false)
            ->exists();

        $hasSchoolId = AthleteDocument::where('athlete_id', $athleteId)
            ->where('document_type', 'School ID')
            ->where('is_deleted', false)
            ->exists();

        $medicalDocsCount = AthleteDocument::where('athlete_id', $athleteId)
            ->whereIn('document_type', ['Medical Record', 'Physical Exam', 'Injury Report', 'Medical Clearance'])
            ->where('is_deleted', false)
            ->count();

        DB::table('tbl_athletes')
            ->where('athlete_id', $athleteId)
            ->update([
                'has_parent_consent_file' => $hasParentConsent,
                'has_valid_id_file'       => $hasSchoolId,
                'medical_documents_count' => $medicalDocsCount,
                'updated_at'              => now(),
            ]);

        Log::info('Athlete document status updated', [
            'athlete_id'         => $athleteId,
            'has_parent_consent' => $hasParentConsent,
            'has_school_id'      => $hasSchoolId,
            'medical_docs_count' => $medicalDocsCount
        ]);
    }

    private function updateAthleteUploadStatus($athleteId, $documentType)
    {
        if ($documentType === 'Parent Consent') {
            DB::table('tbl_athletes')
                ->where('athlete_id', $athleteId)
                ->update(['parent_consent' => 'Pending Review', 'updated_at' => now()]);
        } elseif ($documentType === 'School ID') {
            DB::table('tbl_athletes')
                ->where('athlete_id', $athleteId)
                ->update(['valid_id' => 'Pending Review', 'updated_at' => now()]);
        }
    }

    private function updateAthleteApprovalStatus($athleteId, $documentType, $status)
    {
        if ($documentType === 'Parent Consent') {
            DB::table('tbl_athletes')
                ->where('athlete_id', $athleteId)
                ->update(['parent_consent' => $status, 'updated_at' => now()]);
        } elseif ($documentType === 'Valid ID' || $documentType === 'School ID') {
            DB::table('tbl_athletes')
                ->where('athlete_id', $athleteId)
                ->update(['valid_id' => $status, 'updated_at' => now()]);
        }
    }
}
