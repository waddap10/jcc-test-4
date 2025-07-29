<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */


public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();
    
    // Get the authenticated user from request
    $user = $request->user();
    
    // Redirect based on user role
    if ($user->hasRole('admin')) {
        return redirect()->intended(route('dashboard')); // admin/dashboard
    } elseif ($user->hasRole('kanit')) {
        return redirect()->intended(route('kanit.dashboard')); // kanit/dashboard
    } elseif ($user->hasRole('pic')) {
        return redirect()->intended(route('pic.dashboard')); // pic/dashboard
    }
    
    // Fallback to home if no specific role matches
    return redirect()->intended('/');
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
