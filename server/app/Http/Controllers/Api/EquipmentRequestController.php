<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EquipmentRequest;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class EquipmentRequestController extends Controller
{
    public function loadRequests()
    {
        $user = Auth::user();

        $query = EquipmentRequest::with(['coach', 'reviewer', 'printer'])
            ->select([
                'request_id',
                'coach_id',
                'sport',
                'equipment_name',
                'quantity_requested',
                'reason',
                'status',
                'admin_notes',
                'reviewed_by',
                'reviewed_at',
                'is_printed',
                'printed_at',
                'printed_by',
                'print_count',
                'is_deleted',
                'created_at',
                'updated_at'
            ])
            ->where('is_deleted', 0)
            ->orderBy('created_at', 'desc');

        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $query->where('coach_id', $coach->coach_id);
            }
        }

        $requests = $query->get();

        return response()->json([
            'requests' => $requests
        ], 200);
    }

    public function storeRequest(Request $request)
    {
        $validated = $request->validate([
            'coach_id'           => ['required', 'exists:tbl_coaches,coach_id'],
            'sport'              => ['required', 'max:55'],
            'equipment_name'     => ['required', 'max:255'],
            'quantity_requested' => ['required', 'integer', 'min:1'],
            'reason'             => ['required', 'string', 'max:1000']
        ]);

        $equipmentRequest = EquipmentRequest::create([
            'coach_id'           => $validated['coach_id'],
            'sport'              => $validated['sport'],
            'equipment_name'     => $validated['equipment_name'],
            'quantity_requested' => $validated['quantity_requested'],
            'reason'             => $validated['reason'],
            'status'             => 'Pending',
            'is_deleted'         => 0
        ]);

        return response()->json([
            'message' => 'Equipment Request Submitted Successfully.',
            'request' => $equipmentRequest->load(['coach', 'reviewer'])
        ], 200);
    }

    public function approveRequest(Request $request, EquipmentRequest $equipmentRequest)
    {
        try {
            $validated = $request->validate([
                'admin_notes' => ['nullable', 'string', 'max:1000']
            ]);

            $user    = Auth::user();
            $coachId = $equipmentRequest->coach_id;

            if (!$coachId) {
                return response()->json([
                    'message' => 'Error: Equipment request has no coach assigned.'
                ], 400);
            }

            $equipment = Equipment::where('coach_id', $coachId)
                ->where('equipment_name', $equipmentRequest->equipment_name)
                ->where('is_deleted', 0)
                ->first();

            if ($equipment) {
                $equipment->update([
                    'total_quantity'     => $equipment->total_quantity + $equipmentRequest->quantity_requested,
                    'available_quantity' => $equipment->available_quantity + $equipmentRequest->quantity_requested,
                    'last_updated_by'    => $user->user_id
                ]);
            } else {
                Equipment::create([
                    'coach_id'           => $coachId,
                    'sport'              => $equipmentRequest->sport,
                    'equipment_name'     => $equipmentRequest->equipment_name,
                    'total_quantity'     => $equipmentRequest->quantity_requested,
                    'available_quantity' => $equipmentRequest->quantity_requested,
                    'damaged_quantity'   => 0,
                    'lost_quantity'      => 0,
                    'condition'          => 'New',
                    'notes'              => 'Added via approved request',
                    'last_updated_by'    => $user->user_id,
                    'is_deleted'         => 0
                ]);
            }

            $equipmentRequest->update([
                'status'      => 'Approved',
                'admin_notes' => $validated['admin_notes'],
                'reviewed_by' => $user->user_id,
                'reviewed_at' => now()
            ]);

            return response()->json([
                'message' => 'Equipment Request Approved Successfully.',
                'request' => $equipmentRequest->fresh(['coach', 'reviewer'])
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error approving equipment request: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'message' => 'Error approving request: ' . $e->getMessage()
            ], 500);
        }
    }

    public function rejectRequest(Request $request, EquipmentRequest $equipmentRequest)
    {
        $validated = $request->validate([
            'admin_notes' => ['required', 'string', 'max:1000']
        ]);

        $user = Auth::user();

        $equipmentRequest->update([
            'status'      => 'Rejected',
            'admin_notes' => $validated['admin_notes'],
            'reviewed_by' => $user->user_id,
            'reviewed_at' => now()
        ]);

        return response()->json([
            'message' => 'Equipment Request Rejected.',
            'request' => $equipmentRequest->fresh(['coach', 'reviewer'])
        ], 200);
    }

    public function destroyRequest(EquipmentRequest $equipmentRequest)
    {
        $equipmentRequest->update(['is_deleted' => 1]);

        return response()->json([
            'message' => 'Equipment Request Deleted Successfully.'
        ], 200);
    }

    public function markAsPrinted(Request $request)
    {
        $validated = $request->validate([
            'request_ids'   => 'required|array',
            'request_ids.*' => 'exists:tbl_equipment_requests,request_id',
        ]);

        try {
            $user = Auth::user();

            EquipmentRequest::whereIn('request_id', $validated['request_ids'])
                ->where('status', 'Approved')
                ->each(function (EquipmentRequest $req) use ($user) {
                    // Update request print tracking
                    $req->update([
                        'is_printed'  => true,
                        'printed_at'  => now(),
                        'printed_by'  => $user->user_id,
                        'print_count' => $req->print_count + 1,
                    ]);

                    // Mark the related equipment record as printed
                    Equipment::where('coach_id', $req->coach_id)
                        ->where('equipment_name', $req->equipment_name)
                        ->where('is_deleted', 0)
                        ->update(['is_request_printed' => true]);
                });

            return response()->json([
                'message' => 'Requests marked as printed successfully.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error marking requests as printed: ' . $e->getMessage());

            return response()->json([
                'message' => 'Failed to mark requests as printed.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
