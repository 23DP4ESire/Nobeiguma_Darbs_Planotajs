Backend tests (PHPUnit)
=======================

Added: `backend/tests/Unit/ProfanityFilterTest.php` — unit tests for `App/Utils/ProfanityFilter`.

How to run
----------

- From repository root (recommended):

```bash
cd backend
composer test
```

- Alternatives if `composer test` is not available:

```bash
cd backend
php artisan test
# or
./vendor/bin/phpunit --filter ProfanityFilterTest
```

Notes
-----
- These are PHPUnit unit tests and do not require a database connection.
- Frontend currently has no tests configured (see `frontend/package.json`).
