<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'price',
        'detailed_description',
        'image_path',
        'tags',
        'gallery_images',
        'created_by',
    ];

    /**
     * Attribute casting for structured fields.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'tags' => 'array',
            'gallery_images' => 'array',
        ];
    }

    /**
     * Include computed media URLs in API responses.
     *
     * @var list<string>
     */
    protected $appends = [
        'image_url',
        'gallery_image_urls',
    ];

    /**
     * Get the user who created this service.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get a public URL for the stored image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        return '/storage/' . ltrim($this->image_path, '/');
    }

    /**
     * Get public URLs for all gallery images.
     *
     * @return list<string>
     */
    public function getGalleryImageUrlsAttribute(): array
    {
        $galleryImages = $this->gallery_images;

        if (!is_array($galleryImages)) {
            return [];
        }

        return array_values(array_map(
            static fn (string $path): string => '/storage/' . ltrim($path, '/'),
            array_filter($galleryImages, static fn ($path): bool => is_string($path) && $path !== '')
        ));
    }
}
