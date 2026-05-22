<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
            ], [
                'email.unique' => 'Šis e-pasts jau ir reģistrēts.',
                'email.email' => 'E-pasts ir nepareizā formātā.',
                'password.min' => 'Parole jābūt vismaz 6 rakstzīmes.',
                'name.required' => 'Lietotājvārds ir obligāts.',
                'email.required' => 'E-pasts ir obligāts.',
                'password.required' => 'Parole ir obligāta.',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Konts veiksmīgi izveidots!',
                'token' => $token,
                'user' => $user,
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
                'message' => 'Kļūda kontu izveidojot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login a user
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ], [
                'email.required' => 'E-pasts ir obligāts.',
                'email.email' => 'E-pasts ir nepareizā formātā.',
                'password.required' => 'Parole ir obligāta.',
            ]);

            // Check if user exists
            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nav atrasts konts ar šo e-pastu. Mēģiniet vēlreiz vai izveidojiet jaunu kontu.',
                ], 401);
            }

            // Check if password is correct
            if (!Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Nepareiza parole. Mēģiniet vēlreiz vai izmantojiet "Aizmirsu paroli?" opciju.',
                ], 401);
            }

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'message' => 'Veiksmīgi pierakstījāties!',
                'token' => $token,
                'user' => $user,
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
                'message' => 'Kļūda pierakstīšanās laikā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout a user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Veiksmīgi izrakstījāties!',
        ], 200);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'user' => $request->user(),
        ], 200);
    }

    /**
     * Update the authenticated user's username
     */
    public function updateUsername(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|min:4|max:255',
                'current_password' => 'required|string',
            ], [
                'name.required' => 'Lietotājvārds ir obligāts.',
                'name.min' => 'Lietotājvārdā jābūt vismaz 4 rakstzīmēm.',
                'name.max' => 'Lietotājvārds ir pārāk garš.',
                'current_password.required' => 'Jāievada pašreizējā parole.',
            ]);

            $user = $request->user();

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pašreizējā parole nav pareiza.',
                ], 422);
            }

            $user->name = $validated['name'];
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Lietotājvārds veiksmīgi atjaunināts!',
                'user' => $user->fresh(),
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
                'message' => 'Kļūda lietotājvārda atjaunināšanā: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the authenticated user's password
     */
    public function updatePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:6|confirmed',
            ], [
                'current_password.required' => 'Jāievada pašreizējā parole.',
                'password.required' => 'Jaunā parole ir obligāta.',
                'password.min' => 'Parolei jābūt vismaz 6 rakstzīmes garai.',
                'password.confirmed' => 'Jaunā parole un apstiprinājums nesakrīt.',
            ]);

            $user = $request->user();

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Pašreizējā parole nav pareiza.',
                ], 422);
            }

            $user->password = $validated['password'];
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Parole veiksmīgi atjaunināta!',
                'user' => $user->fresh(),
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
                'message' => 'Kļūda paroles atjaunināšanā: ' . $e->getMessage(),
            ], 500);
        }
    }
}
