<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Equipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EquipmentController extends Controller
{
    public function loadEquipment()
    {
        $user = Auth::user();

        $query = Equipment::with(['coach', 'updater'])
            ->where('is_deleted', 0)
            ->orderBy('sport', 'asc')
            ->orderBy('equipment_name', 'asc');

        // If coach, only show their sport's equipment
        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();
            if ($coach) {
                $query->where('coach_id', $coach->coach_id);
            }
        }

        $equipment = $query->get();

        return response()->json([
            'equipment' => $equipment
        ], 200);
    }

    public function getEquipment($equipmentId)
    {
        $equipment = Equipment::with(['coach', 'updater'])
            ->where('equipment_id', $equipmentId)
            ->where('is_deleted', 0)
            ->firstOrFail();

        return response()->json([
            'equipment' => $equipment
        ], 200);
    }

    public function storeEquipment(Request $request)
    {
        $validated = $request->validate([
            'coach_id' => ['required', 'exists:tbl_coaches,coach_id'],
            'sport' => ['required', 'max:55'],
            'equipment_name' => ['required', 'max:255'],
            'total_quantity' => ['required', 'integer', 'min:0'],
            'available_quantity' => ['required', 'integer', 'min:0'],
            'damaged_quantity' => ['nullable', 'integer', 'min:0'],
            'lost_quantity' => ['nullable', 'integer', 'min:0'],
            'condition' => ['required', 'in:New,Good,Fair,Poor'],
            'notes' => ['nullable', 'string', 'max:1000']
        ]);

        $user = Auth::user();

        $equipment = Equipment::create([
            'coach_id' => $validated['coach_id'],
            'sport' => $validated['sport'],
            'equipment_name' => $validated['equipment_name'],
            'total_quantity' => $validated['total_quantity'],
            'available_quantity' => $validated['available_quantity'],
            'damaged_quantity' => $validated['damaged_quantity'] ?? 0,
            'lost_quantity' => $validated['lost_quantity'] ?? 0,
            'condition' => $validated['condition'],
            'notes' => $validated['notes'],
            'last_updated_by' => $user->user_id,
            'is_deleted' => 0
        ]);

        return response()->json([
            'message' => 'Equipment Successfully Added.',
            'equipment' => $equipment->load(['coach', 'updater'])
        ], 200);
    }

    public function updateEquipment(Request $request, Equipment $equipment)
    {
        $user = Auth::user();

        // Coaches can only update their own equipment and limited fields
        if ($user->role === 'Coach') {
            $coach = \App\Models\Coach::where('user_id', $user->user_id)->first();

            if (!$coach || $equipment->coach_id !== $coach->coach_id) {
                return response()->json([
                    'message' => 'Unauthorized. You can only update your own equipment.'
                ], 403);
            }

            $validated = $request->validate([
                'damaged_quantity' => ['required', 'integer', 'min:0'],
                'lost_quantity' => ['required', 'integer', 'min:0'],
                'condition' => ['required', 'in:New,Good,Fair,Poor'],
                'notes' => ['nullable', 'string', 'max:1000']
            ]);

            // Recalculate available quantity
            $availableQuantity = $equipment->total_quantity - $validated['damaged_quantity'] - $validated['lost_quantity'];

            $equipment->update([
                'damaged_quantity' => $validated['damaged_quantity'],
                'lost_quantity' => $validated['lost_quantity'],
                'available_quantity' => max(0, $availableQuantity),
                'condition' => $validated['condition'],
                'notes' => $validated['notes'],
                'last_updated_by' => $user->user_id
            ]);

            return response()->json([
                'message' => 'Equipment Status Updated Successfully.',
                'equipment' => $equipment->fresh(['coach', 'updater'])
            ], 200);
        }

        // Admin can update everything
        $validated = $request->validate([
            'coach_id' => ['required', 'exists:tbl_coaches,coach_id'],
            'sport' => ['required', 'max:55'],
            'equipment_name' => ['required', 'max:255'],
            'total_quantity' => ['required', 'integer', 'min:0'],
            'available_quantity' => ['required', 'integer', 'min:0'],
            'damaged_quantity' => ['nullable', 'integer', 'min:0'],
            'lost_quantity' => ['nullable', 'integer', 'min:0'],
            'condition' => ['required', 'in:New,Good,Fair,Poor'],
            'notes' => ['nullable', 'string', 'max:1000']
        ]);

        $equipment->update([
            'coach_id' => $validated['coach_id'],
            'sport' => $validated['sport'],
            'equipment_name' => $validated['equipment_name'],
            'total_quantity' => $validated['total_quantity'],
            'available_quantity' => $validated['available_quantity'],
            'damaged_quantity' => $validated['damaged_quantity'] ?? 0,
            'lost_quantity' => $validated['lost_quantity'] ?? 0,
            'condition' => $validated['condition'],
            'notes' => $validated['notes'],
            'last_updated_by' => $user->user_id
        ]);

        return response()->json([
            'message' => 'Equipment Successfully Updated.',
            'equipment' => $equipment->fresh(['coach', 'updater'])
        ], 200);
    }

    public function destroyEquipment(Equipment $equipment)
    {
        $equipment->update([
            'is_deleted' => 1
        ]);

        return response()->json([
            'message' => 'Equipment Successfully Deleted.'
        ], 200);
    }
}
