<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BeoController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\KanitController;
use App\Http\Controllers\OrderAttachmentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PicController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\VenueController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'role:sales'])->group(function () {
    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status.update');
    Route::get('calendars', [OrderController::class, 'calendar'])->name('orders.calendar');
    Route::patch('orders/{order}/acc-kanit', [OrderController::class, 'accKanit'])->name('orders.acc-kanit');
    Route::patch('orders/{order}/selesai', [OrderController::class, 'markSelesai'])->name('orders.selesai');

    Route::get('orders/{order}/schedules', [ScheduleController::class, 'index'])->name('orders.schedules.index');
    Route::get('orders/{order}/schedules/create', [ScheduleController::class, 'create'])->name('orders.schedules.create');
    Route::post('orders/{order}/schedules', [ScheduleController::class, 'store'])->name('orders.schedules.store');
    Route::delete('orders/{order}/schedules/{schedule}', [ScheduleController::class, 'destroy'])->name('orders.schedules.destroy');

    Route::prefix('orders/{order}/beos')->name('orders.beos.')->group(function () {
        Route::get('/', [BeoController::class, 'index'])->name('index');
        Route::get('/create', [BeoController::class, 'create'])->name('create');
        Route::post('/', [BeoController::class, 'store'])->name('store');
        Route::get('/edit', [BeoController::class, 'edit'])->name('edit');
        Route::post('/update', [BeoController::class, 'update'])->name('update');
        Route::delete('/{beo}', [BeoController::class, 'destroy'])->name('destroy');
    });

    Route::get('orders/{order}/attachments', [OrderAttachmentController::class, 'index'])->name('orders.attachments.index');
    Route::get('orders/{order}/attachments/create', [OrderAttachmentController::class, 'create'])->name('orders.attachments.create');
    Route::post('orders/{order}/attachments', [OrderAttachmentController::class, 'store'])->name('orders.attachments.store');
    Route::delete('attachments/{attachment}', [OrderAttachmentController::class, 'destroy'])->name('attachments.destroy');

    Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');

    Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('customers/create', [CustomerController::class, 'create'])->name('customers.create');
    Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
    Route::get('customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::patch('customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');

    // Sales can only view venues (read-only)
    Route::get('venues', [VenueController::class, 'salesIndex'])->name('venues.index');
    Route::get('venues/{venue}', [VenueController::class, 'salesShow'])->name('venues.show');
});

Route::middleware(['auth', 'role:kanit'])->prefix('kanit')->name('kanit.')->group(function () {
    Route::get('dashboard', [KanitController::class, 'index'])->name('dashboard');
    Route::get('orders/{order}', [KanitController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/status', [KanitController::class, 'updateStatus'])->name('orders.status.update');
    Route::patch('{order}/acc-kanit', [KanitController::class, 'accKanit'])->name('acc-kanit');
});

Route::middleware(['auth', 'role:pic'])->prefix('pic')->name('pic.')->group(function () {
    Route::get('dashboard', [PicController::class, 'index'])->name('dashboard');
    Route::get('orders/{order}', [PicController::class, 'show'])->name('orders.show');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');

    // Admin has full CRUD access to venues
    Route::get('venues', [VenueController::class, 'adminIndex'])->name('venues.index');
    Route::get('venues/create', [VenueController::class, 'create'])->name('venues.create');
    Route::post('venues', [VenueController::class, 'store'])->name('venues.store');
    Route::get('venues/{venue}', [VenueController::class, 'adminShow'])->name('venues.show');
    Route::get('venues/{venue}/edit', [VenueController::class, 'edit'])->name('venues.edit');
    Route::patch('venues/{venue}', [VenueController::class, 'update'])->name('venues.update');
    Route::delete('venues/{venue}', [VenueController::class, 'destroy'])->name('venues.destroy');

    Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::get('departments/create', [DepartmentController::class, 'create'])->name('departments.create');
    Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::get('departments/{department}/edit', [DepartmentController::class, 'edit'])->name('departments.edit');
    Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

    Route::get('accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::get('accounts/create', [AccountController::class, 'create'])->name('accounts.create');
    Route::post('accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::get('accounts/{account}', [AccountController::class, 'show'])->name('accounts.show');
    Route::get('accounts/{account}/edit', [AccountController::class, 'edit'])->name('accounts.edit');
    Route::patch('accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::delete('accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');

    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}', [RoleController::class, 'show'])->name('roles.show');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::patch('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    Route::post('accounts/{account}/attach-role', [AccountController::class, 'attachRole'])->name('accounts.attach-role');
    Route::delete('accounts/{account}/detach-role/{role}', [AccountController::class, 'detachRole'])->name('accounts.detach-role');
    Route::post('accounts/{account}/attach-department', [AccountController::class, 'attachDepartment'])->name('accounts.attach-department');
    Route::delete('accounts/{account}/detach-department', [AccountController::class, 'detachDepartment'])->name('accounts.detach-department');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';