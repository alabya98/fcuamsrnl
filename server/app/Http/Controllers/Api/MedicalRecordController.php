<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function loadMedicalRecordsByAthlete($athleteId)
    {
        $medicalRecords = MedicalRecord::where('athlete_id', $athleteId)
            ->where('is_deleted', false)
            ->orderBy('record_date', 'desc')
            ->get();

        return response()->json([
            'medical_records' => $medicalRecords
        ], 200);
    }

    public function storeMedicalRecord(Request $request)
    {
        $validated = $request->validate([
            'athlete_id' => ['required', 'exists:tbl_athletes,athlete_id'],
            'record_date' => ['required', 'date'],
            'record_type' => ['required', 'max:100'],
            'diagnosis' => ['required', 'max:255'],
            'treatment' => ['required', 'max:255'],
            'prescribed_medication' => ['nullable', 'max:255'],
            'doctor_name' => ['required', 'max:255'],
            'hospital_clinic' => ['nullable', 'max:255'],
            'notes' => ['nullable'],
            'follow_up_date' => ['nullable', 'date'],
            'status' => ['required', 'in:Active,Ongoing,Resolved']
        ]);

        MedicalRecord::create([
            'athlete_id' => $validated['athlete_id'],
            'record_date' => $validated['record_date'],
            'record_type' => $validated['record_type'],
            'diagnosis' => $validated['diagnosis'],
            'treatment' => $validated['treatment'],
            'prescribed_medication' => $validated['prescribed_medication'],
            'doctor_name' => $validated['doctor_name'],
            'hospital_clinic' => $validated['hospital_clinic'],
            'notes' => $validated['notes'],
            'follow_up_date' => $validated['follow_up_date'],
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Medical Record Successfully Saved.'
        ], 200);
    }

    public function updateMedicalRecord(Request $request, MedicalRecord $medicalRecord)
    {
        $validated = $request->validate([
            'athlete_id' => ['required', 'exists:tbl_athletes,athlete_id'],
            'record_date' => ['required', 'date'],
            'record_type' => ['required', 'max:100'],
            'diagnosis' => ['required', 'max:255'],
            'treatment' => ['required', 'max:255'],
            'prescribed_medication' => ['nullable', 'max:255'],
            'doctor_name' => ['required', 'max:255'],
            'hospital_clinic' => ['nullable', 'max:255'],
            'notes' => ['nullable'],
            'follow_up_date' => ['nullable', 'date'],
            'status' => ['required', 'in:Active,Ongoing,Resolved']
        ]);

        $medicalRecord->update([
            'athlete_id' => $validated['athlete_id'],
            'record_date' => $validated['record_date'],
            'record_type' => $validated['record_type'],
            'diagnosis' => $validated['diagnosis'],
            'treatment' => $validated['treatment'],
            'prescribed_medication' => $validated['prescribed_medication'],
            'doctor_name' => $validated['doctor_name'],
            'hospital_clinic' => $validated['hospital_clinic'],
            'notes' => $validated['notes'],
            'follow_up_date' => $validated['follow_up_date'],
            'status' => $validated['status']
        ]);

        return response()->json([
            'message' => 'Medical Record Successfully Updated.',
            'medical_record' => $medicalRecord
        ], 200);
    }

    public function destroyMedicalRecord(MedicalRecord $medicalRecord)
    {
        $medicalRecord->update([
            'is_deleted' => true
        ]);

        return response()->json([
            'message' => 'Medical Record Successfully Deleted.'
        ], 200);
    }
}
