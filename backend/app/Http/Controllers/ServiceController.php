<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Utils\ProfanityFilter;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    /**
     * Allowed tag values for filtering and display.
     *
     * @var list<string>
     */
    private const ALLOWED_TAGS = [
        '1 stava',
        '2 stava',
        'privatmaja',
        'biznesi',
    ];

    /**
     * Get all services (public endpoint)
     */
    public function index()
    {
        $services = Service::query()
            ->latest('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'services' => $services,
            'count' => $services->count(),
        ], 200);
    }

    /**
     * Create a new service (admin only)
     */
    public function store(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas izveidot pakalpojumus.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|min:3|max:255',
                'description' => 'required|string|min:5|max:1000',
                'price' => 'required|numeric|min:0',
                'detailed_description' => 'nullable|string|min:5|max:5000',
                'tags' => 'nullable|array',
                'tags.*' => ['string', Rule::in(self::ALLOWED_TAGS)],
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'gallery_images' => 'nullable|array|max:4',
                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            ], [
                'title.required' => 'Nosaukums ir obligāts.',
                'title.min' => 'Nosaukumam jābūt vismaz 3 rakstzīmēm.',
                'title.max' => 'Nosaukums ir pārāk garš.',
                'description.required' => 'Apraksts ir obligāts.',
                'description.min' => 'Aprakstam jābūt vismaz 5 rakstzīmēm.',
                'description.max' => 'Apraksts ir pārāk garš.',
                'price.required' => 'Cena ir obligāta.',
                'price.numeric' => 'Cenai jābūt skaitlim.',
                'price.min' => 'Cena nevar būt negatīva.',
                'detailed_description.min' => 'Paplašinātajam aprakstam jābūt vismaz 5 rakstzīmēm.',
                'detailed_description.max' => 'Paplašinātais apraksts ir pārāk garš.',
                'tags.array' => 'Tagiem jābūt saraksta formātā.',
                'tags.*.in' => 'Izvēlēts neatļauts tags.',
                'image.image' => 'Failam jābūt attēlam.',
                'image.mimes' => 'Atbalstītie formāti: jpeg, png, jpg, gif.',
                'image.max' => 'Attēls pārāk liels (max 5MB).',
                'gallery_images.array' => 'Galerijas attēliem jābūt sarakstā.',
                'gallery_images.max' => 'Var pievienot ne vairāk kā 4 galerijas attēlus.',
                'gallery_images.*.image' => 'Katram galerijas failam jābūt attēlam.',
                'gallery_images.*.mimes' => 'Galerijai atbalstītie formāti: jpeg, png, jpg, gif.',
                'gallery_images.*.max' => 'Katrs galerijas attēls var būt līdz 5MB.',
                'remove_gallery.boolean' => 'remove_gallery must be a boolean flag.',
                'remove_image.boolean' => 'remove_image must be a boolean flag.',
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

            if (!empty($validated['detailed_description'])
                && ProfanityFilter::hasProfanity($validated['detailed_description'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Paplašinātajā aprakstā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $imagePath = $file->storeAs('services', $filename, 'public');
            }

            $galleryImagePaths = $this->storeGalleryImages($request);

            $service = Service::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'detailed_description' => $validated['detailed_description'] ?? null,
                'image_path' => $imagePath,
                'tags' => $validated['tags'] ?? [],
                'gallery_images' => $galleryImagePaths,
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Pakalpojums veiksmīgi izveidots!',
                'service' => $service,
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
                'message' => 'Kļūda pakalpojuma izveidošanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a specific service
     */
    public function show(Service $service)
    {
        return response()->json([
            'status' => 'success',
            'service' => $service,
        ], 200);
    }

    /**
     * Update a service (admin only)
     */
    public function update(Request $request, Service $service)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas rediģēt pakalpojumus.',
            ], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'required|string|min:3|max:255',
                'description' => 'required|string|min:5|max:1000',
                'price' => 'required|numeric|min:0',
                'detailed_description' => 'nullable|string|min:5|max:5000',
                'tags' => 'nullable|array',
                'tags.*' => ['string', Rule::in(self::ALLOWED_TAGS)],
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
                'gallery_images' => 'nullable|array|max:4',
                'gallery_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            ], [
                'title.required' => 'Nosaukums ir obligāts.',
                'title.min' => 'Nosaukumam jābūt vismaz 3 rakstzīmēm.',
                'title.max' => 'Nosaukums ir pārāk garš.',
                'description.required' => 'Apraksts ir obligāts.',
                'description.min' => 'Aprakstam jābūt vismaz 5 rakstzīmēm.',
                'description.max' => 'Apraksts ir pārāk garš.',
                'price.required' => 'Cena ir obligāta.',
                'price.numeric' => 'Cenai jābūt skaitlim.',
                'price.min' => 'Cena nevar būt negatīva.',
                'detailed_description.min' => 'Paplašinātajam aprakstam jābūt vismaz 5 rakstzīmēm.',
                'detailed_description.max' => 'Paplašinātais apraksts ir pārāk garš.',
                'tags.array' => 'Tagiem jābūt saraksta formātā.',
                'tags.*.in' => 'Izvēlēts neatļauts tags.',
                'image.image' => 'Failam jābūt attēlam.',
                'image.mimes' => 'Atbalstītie formāti: jpeg, png, jpg, gif.',
                'image.max' => 'Attēls pārāk liels (max 5MB).',
                'gallery_images.array' => 'Galerijas attēliem jābūt sarakstā.',
                'gallery_images.max' => 'Var pievienot ne vairāk kā 4 galerijas attēlus.',
                'gallery_images.*.image' => 'Katram galerijas failam jābūt attēlam.',
                'gallery_images.*.mimes' => 'Galerijai atbalstītie formāti: jpeg, png, jpg, gif.',
                'gallery_images.*.max' => 'Katrs galerijas attēls var būt līdz 5MB.',
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

            if (!empty($validated['detailed_description'])
                && ProfanityFilter::hasProfanity($validated['detailed_description'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Paplašinātajā aprakstā tiek lietoti neatļauti vārdi. Lūdzu, labojiet.',
                ], 422);
            }

            $updateData = [
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'detailed_description' => $validated['detailed_description'] ?? null,
                'tags' => $validated['tags'] ?? [],
            ];

            // Handle new image upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($service->image_path && Storage::disk('public')->exists($service->image_path)) {
                    Storage::disk('public')->delete($service->image_path);
                }

                $file = $request->file('image');
                $filename = time() . '_' . $file->getClientOriginalName();
                $updateData['image_path'] = $file->storeAs('services', $filename, 'public');
            }

            // Optionally remove main image
            if ($request->boolean('remove_image')) {
                if ($service->image_path && Storage::disk('public')->exists($service->image_path)) {
                    Storage::disk('public')->delete($service->image_path);
                }
                $updateData['image_path'] = null;
            }

            // If client requests removing gallery images explicitly, delete them
            if ($request->boolean('remove_gallery')) {
                $this->deleteGalleryImages($service->gallery_images);
                $updateData['gallery_images'] = [];
            } elseif ($request->hasFile('gallery_images')) {
                // Replace existing gallery images with newly uploaded ones
                $this->deleteGalleryImages($service->gallery_images);
                $updateData['gallery_images'] = $this->storeGalleryImages($request);
            }

            $service->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Pakalpojums veiksmīgi atjaunināts!',
                'service' => $service->fresh(),
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
                'message' => 'Kļūda pakalpojuma atjaunināšanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a service (admin only)
     */
    public function destroy(Request $request, Service $service)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jums nav atļaujas dzēst pakalpojumus.',
            ], 403);
        }

        try {
            // Delete image file
            if ($service->image_path && Storage::disk('public')->exists($service->image_path)) {
                Storage::disk('public')->delete($service->image_path);
            }

            $this->deleteGalleryImages($service->gallery_images);

            $serviceName = $service->title;
            $service->delete();

            return response()->json([
                'status' => 'success',
                'message' => "Pakalpojums '{$serviceName}' veiksmīgi dzēsts!",
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kļūda pakalpojuma dzēšanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store uploaded gallery images and return their storage paths.
     *
     * @return list<string>
     */
    private function storeGalleryImages(Request $request): array
    {
        if (!$request->hasFile('gallery_images')) {
            return [];
        }

        $galleryImagePaths = [];

        foreach ($request->file('gallery_images') as $file) {
            $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
            $galleryImagePaths[] = $file->storeAs('services/gallery', $filename, 'public');
        }

        return $galleryImagePaths;
    }

    /**
     * Delete gallery image files from storage.
     *
     * @param mixed $galleryImages
     */
    private function deleteGalleryImages($galleryImages): void
    {
        if (!is_array($galleryImages)) {
            return;
        }

        foreach ($galleryImages as $imagePath) {
            if (is_string($imagePath) && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }
    }
}
