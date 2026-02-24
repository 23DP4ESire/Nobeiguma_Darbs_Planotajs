<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test endpoint to check if API is working
Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Laravel API is working! ✓',
        'timestamp' => now(),
    ]);
});

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected auth routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});

// Add your API routes below this line
// Example:
// Route::get('/posts', [PostController::class, 'index']);
// Route::post('/posts', [PostController::class, 'store']);

