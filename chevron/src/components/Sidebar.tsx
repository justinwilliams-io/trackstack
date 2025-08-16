import { createSignal } from 'solid-js';
import { A, useLocation, useNavigate } from '@solidjs/router';
import { Icon } from 'solid-heroicons';
import { home, documentText, cog, arrowLeftOnRectangle } from 'solid-heroicons/solid';

const Sidebar = () => {
    const [isOpen, setIsOpen] = createSignal(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname.includes(path);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                class="md:hidden fixed top-4 left-4 z-20 text-[var(--color-secondary)] text-2xl"
                onClick={() => setIsOpen(!isOpen())}
            >
                ☰
            </button>

            {/* Sidebar */}
            <nav class={`bg-[var(--color-neutral)] h-screen w-52 fixed top-0 left-0 flex flex-col px-4 py-6 transition-transform duration-300 ${isOpen() ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-30`}>
                {/* Logo at top */}
                <div class="text-2xl font-bold text-[var(--color-secondary)] mb-8">TrackStack</div>

                {/* Navigation links */}
                <ul class="flex-1 space-y-2">
                    <li>
                        <A href="/app/dashboard" class={`flex items-center px-4 py-2 rounded-md ${isActive('dashboard') ? 'bg-[var(--color-card)]' : 'hover:bg-[var(--color-card)]'} text-[var(--color-textLight)] font-medium`} onClick={() => setIsOpen(false)}>
                            <Icon path={home} class="w-5 h-5 mr-2" />
                            Dashboard
                        </A>
                    </li>
                    <li>
                        <A href="/app/subscriptions" class={`flex items-center px-4 py-2 rounded-md ${isActive('subscriptions') ? 'bg-[var(--color-card)]' : 'hover:bg-[var(--color-card)]'} text-[var(--color-textLight)] font-medium`} onClick={() => setIsOpen(false)}>
                            <Icon path={documentText} class="w-5 h-5 mr-2" />
                            Subscriptions
                        </A>
                    </li>
                    <li>
                        <A href="/app/settings" class={`flex items-center px-4 py-2 rounded-md ${isActive('settings') ? 'bg-[var(--color-card)]' : 'hover:bg-[var(--color-card)]'} text-[var(--color-textLight)] font-medium`} onClick={() => setIsOpen(false)}>
                            <Icon path={cog} class="w-5 h-5 mr-2" />
                            Settings
                        </A>
                    </li>
                </ul>

                {/* Sign Out at bottom, styled like nav items */}
                <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    class="mt-auto flex items-center px-4 py-2 rounded-md hover:bg-[var(--color-card)] text-[var(--color-textLight)] font-medium"
                >
                    <Icon path={arrowLeftOnRectangle} class="w-5 h-5 mr-2" />
                    Sign Out
                </button>
            </nav>

            {/* Overlay for mobile */}
            {isOpen() && (
                <div
                    class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
