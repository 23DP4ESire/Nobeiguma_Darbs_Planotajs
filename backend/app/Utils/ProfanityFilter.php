<?php

namespace App\Utils;

class ProfanityFilter
{
    /**
     * List of profanity words to filter (Latvian and English)
     */
    protected static array $forbiddenWords = [
        // English profanity
        'fuck', 'shit', 'damn', 'crap', 'ass', 'bastard', 'bitch', 'hell',
        'piss', 'dick', 'cock', 'pussy', 'asshole', 'motherfucker',
        // Latvian profanity
        'jēbāt', 'kūls', 'sūds', 'pakaļa', 'mājējas', 'jēbāšanās',
    ];

    /**
     * Check if text contains profanity
     */
    public static function hasProfanity(string $text): bool
    {
        $lowerText = strtolower($text);

        foreach (self::$forbiddenWords as $word) {
            if (str_contains($lowerText, $word)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get list of forbidden words found in text
     */
    public static function findProfanity(string $text): array
    {
        $found = [];
        $lowerText = strtolower($text);

        foreach (self::$forbiddenWords as $word) {
            if (str_contains($lowerText, $word)) {
                $found[] = $word;
            }
        }

        return $found;
    }

    /**
     * Filter out profanity from text (replace with asterisks)
     */
    public static function filter(string $text): string
    {
        $filtered = $text;

        foreach (self::$forbiddenWords as $word) {
            $pattern = '/\b' . preg_quote($word, '/') . '\b/i';
            $replacement = str_repeat('*', strlen($word));
            $filtered = preg_replace($pattern, $replacement, $filtered);
        }

        return $filtered;
    }
}
