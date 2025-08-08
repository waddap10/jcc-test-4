import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { useAuth } from '@/hooks/useAuth'

export default function Welcome() {
    const { user, hasRole } = useAuth()

    const getDashboardRoute = () => {
        if (hasRole('admin')) {
            return 'admin.dashboard'
        } else if (hasRole('sales')) {
            return 'dashboard'
        } else if (hasRole('kanit')) {
            return 'kanit.dashboard'
        } else if (hasRole('pic')) {
            return 'pic.dashboard'
        }
        // Fallback for users without roles or unrecognized roles
        return 'dashboard'
    }

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {user ? (
                            <Link
                                href={route(getDashboardRoute())}
                                className="inline-block rounded-sm border border-[#19140035]
               px-5 py-1.5 text-sm leading-normal text-[#1b1b18]
               bg-black text-white
               hover:border-[#1915014a] dark:border-[#3E3E3A]
               dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-block rounded-sm border border-transparent 
               px-5 py-1.5 text-sm leading-normal text-[#1b1b18] 
               bg-black text-white
               hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                            >
                                Log in
                            </Link>
                        )}
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col items-center justify-center lg:max-w-4xl">
                        <div className="text-center">
                            <h1 className="text-6xl lg:text-8xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-8">
                                Reservation App
                            </h1>
                        </div>
                    </main>
                </div>

                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    )
}