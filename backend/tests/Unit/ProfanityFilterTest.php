<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Utils\ProfanityFilter;

class ProfanityFilterTest extends TestCase
{
    public function test_has_profanity_detects_words(): void
    {
        $this->assertTrue(ProfanityFilter::hasProfanity('This is shit'));
        $this->assertTrue(ProfanityFilter::hasProfanity('Jēbāt something'));
        $this->assertFalse(ProfanityFilter::hasProfanity('This is clean text'));
    }

    public function test_find_profanity_returns_list(): void
    {
        $found = ProfanityFilter::findProfanity('shit and fuck and jēbāt');
        $this->assertContains('fuck', $found);
        $this->assertContains('jēbāt', $found);
        $this->assertContains('shit', $found);
        $this->assertCount(3, $found);
    }

    public function test_filter_replaces_words_with_asterisks(): void
    {
        $filtered = ProfanityFilter::filter('This is shit and damn.');

        $this->assertStringNotContainsString('shit', $filtered);
        $this->assertStringNotContainsString('damn', $filtered);
        $this->assertStringContainsString('****', $filtered);
    }

    public function test_filter_preserves_non_profanity(): void
    {
        $filtered = ProfanityFilter::filter('Hello world');
        $this->assertEquals('Hello world', $filtered);
    }
}
