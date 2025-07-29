<?php

use App\Http\Controllers\BeoController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\KanitController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PicController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('orders', [OrderController::class, 'index'])
        ->name('orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])
        ->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])
        ->name('orders.store');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])
        ->name('orders.destroy');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.status.update');
    Route::get('calendars', [OrderController::class, 'calendar'])->name('orders.calendar');
    Route::patch('/orders/{order}/acc-kanit', [OrderController::class, 'accKanit'])
        ->name('orders.acc-kanit');
    Route::resource('orders.schedules', ScheduleController::class)
        ->only(['index', 'create', 'store', 'destroy']);
    Route::resource('orders.beos', BeoController::class)
        ->only(['index', 'create', 'store', 'destroy']);
    Route::resource('departments', DepartmentController::class)
        ->only(['index', 'create', 'store', 'destroy']);
        Route::resource('customers', CustomerController::class);
    
    // Venue routes  
    Route::resource('venues', VenueController::class);
    Route::patch('orders/{order}/selesai', [OrderController::class, 'markSelesai'])
        ->name('orders.selesai');
});

Route::middleware(['auth', 'role:kanit'])
    ->prefix('kanit')
    ->name('kanit.')
    ->group(function () {

        // 1) Kanit Dashboard
        //    GET  /kanit/dashboard
        //    name: kanit.dashboard
        Route::get('dashboard', [KanitController::class, 'index'])
            ->name('dashboard');

        // 2) Show a single order
        //    GET  /kanit/orders/{order}
        //    name: kanit.orders.show
        Route::get('/orders/{order}', [KanitController::class, 'show'])
            ->name('orders.show');

        // 3) Update status on that order
        //    PATCH /kanit/orders/{order}/status
        //    name: kanit.orders.status.update
        Route::patch('/orders/{order}/status', [KanitController::class, 'updateStatus'])
            ->name('orders.status.update');
        Route::patch('/{order}/acc-kanit', [KanitController::class, 'accKanit'])
        ->name('acc-kanit');
    });

/* Route::middleware(['auth', 'verified', 'role:kanit'])->group(function () {
    Route::get('kanit/dashboard', [KanitController::class, 'index'])
     ->name('kanit.dashboard');
    Route::get('kanit/show/{order}', [KanitController::class, 'index'])
     ->name('kanit.dashboard');
}); */

Route::middleware(['auth', 'role:pic'])
    ->prefix('pic')
    ->name('pic.')
    ->group(function () {

        // 1) Kanit Dashboard
        //    GET  /kanit/dashboard
        //    name: kanit.dashboard
        Route::get('dashboard', [PicController::class, 'index'])
            ->name('dashboard');

        // 2) Show a single order
        //    GET  /kanit/orders/{order}
        //    name: kanit.orders.show
        Route::get('/orders/{order}', [PicController::class, 'show'])
            ->name('orders.show');

        // 3) Update status on that order
        //    PATCH /kanit/orders/{order}/status
        //    name: kanit.orders.status.update
    });

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
