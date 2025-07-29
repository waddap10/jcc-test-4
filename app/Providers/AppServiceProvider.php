<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Validator::extend(
            'username',
            function ($attribute, $value, $parameters, $validator) {
                // Example: 3–20 chars, letters, numbers, underscores only
                return preg_match('/^[A-Za-z0-9_]{3,20}$/', $value);
            },
            'The :attribute must be 3–20 characters and contain only letters, numbers, and underscores.'
        );
        Inertia::share([
        'auth' => function () {
            $user = Auth::user();
            if (! $user) {
                return ['user' => null];
            }

            return [
                'user' => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    // send an array of strings: ['admin','kanit', …]
                    'roles' => $user->roles->pluck('name'),
                ],
            ];
        },
    ]);



    }
}
