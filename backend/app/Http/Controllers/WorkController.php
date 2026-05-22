<?php

namespace App\Http\Controllers;

use App\Models\Work;
use App\Utils\ProfanityFilter;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class WorkController extends Controller
{
    /**
     * Get all works (public endpoint)
     */
    public function index()
    {
        $works = Work::select('id', 'title', 'description', 'image_path', 'created_at')
            ->latest('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'works' => $works,
            'count' => $works->count(),
        ], 200);
    }

    /**
     * Create a new work (admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas izveidot darbus.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|min:3|max:255',
                'description' => 'required|string|min:5|max:1000',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            ], [
                'title.required' => 'Nosaukums ir obligāts.',
                'title.min' => 'Nosaukumam jābūt vismaz 3 rakstzīmēm.',
                'title.max' => 'Nosaukums ir pārāk garš.',
                'description.required' => 'Apraksts ir obligāts.',
                'description.min' => 'Aprakstam jābūt vismaz 5 rakstzīmēm.',
                'description.max' => 'Apraksts ir pārāk garš.',
                'image.required' => 'Attēls ir obligāts.',
                'image.image' => 'Failam jābūt attēlam.',
                'image.mimes' => 'Atbalstītie formāti: jpeg, png, jpg, gif.',
                'image.max' => 'Attēls pārāk liels (max 5MB).',
            ]);

            // Check for profanity
            if (ProfanityFilter::hasProfanity($validated['title'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nosaukumā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            if (ProfanityFilter::hasProfanity($validated['description'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Aprakstā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $imagePath = $file->storeAs('works', $filename, 'public');
            }

            $work = Work::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'image_path' => $imagePath,
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Darbs veiksmīgi izveidots!',
                'work' => $work,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validācijas kļūda',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kļūda darba izveidošanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a specific work
     */
    public function show(Work $work)
    {
        return response()->json([
            'status' => 'success',
            'work' => $work,
        ], 200);
    }

    /**
     * Update a work (admin only)
     */
    public function update(Request $request, Work $work)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas rediģēt darbus.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|min:3|max:255',
                'description' => 'required|string|min:5|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            ], [
                'title.required' => 'Nosaukums ir obligāts.',
                'title.min' => 'Nosaukumam jābūt vismaz 3 rakstzīmēm.',
                'title.max' => 'Nosaukums ir pārāk garš.',
                'description.required' => 'Apraksts ir obligāts.',
                'description.min' => 'Aprakstam jābūt vismaz 5 rakstzīmēm.',
                'description.max' => 'Apraksts ir pārāk garš.',
                'image.image' => 'Failam jābūt attēlam.',
                'image.mimes' => 'Atbalstītie formāti: jpeg, png, jpg, gif.',
                'image.max' => 'Attēls pārāk liels (max 5MB).',
            ]);

            // Check for profanity
            if (ProfanityFilter::hasProfanity($validated['title'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nosaukumā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            if (ProfanityFilter::hasProfanity($validated['description'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Aprakstā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            $updateData = [
                'title' => $validated['title'],
                'description' => $validated['description'],
            ];

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($work->image_path && Storage::disk('public')->exists($work->image_path)) {
                    Storage::disk('public')->delete($work->image_path);
                }

                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $updateData['image_path'] = $file->storeAs('works', $filename, 'public');
            }

            $work->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Darbs veiksmīgi atjaunināts!',
                'work' => $work->fresh(),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validācijas kļūda',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kļūda darba atjaunināšanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a work (admin only)
     */
    public function destroy(Request $request, Work $work)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas dzēst darbus.',
            ], 403);
        }

        try {
            // Delete image file
            if ($work->image_path && Storage::disk('public')->exists($work->image_path)) {
                Storage::disk('public')->delete($work->image_path);
            }

            $workName = $work->title;
            $work->delete();

            return response()->json([
                'status' => 'success',
                'message' => "Darbs '{$workName}' veiksmīgi dzēsts!",
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kļūda darba dzēšanā: ' . $e->getMessage(),
            ], 500);
        }
    }
}
