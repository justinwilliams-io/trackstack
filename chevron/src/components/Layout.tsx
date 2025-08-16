import { useNavigate } from '@solidjs/router';
import { onMount } from 'solid-js';
import Sidebar from './Sidebar';

const Layout = (props: any) => {
    const navigate = useNavigate();

    onMount(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    });

    return (
        <div class="flex min-h-screen">
            <Sidebar />
            <main class="flex-1 p-6 bg-[var(--color-bg)] ml-0 md:ml-52"> {/* Adjusted for sidebar width */}
                {props.children}
            </main>
        </div>
    );
};

export default Layout;
