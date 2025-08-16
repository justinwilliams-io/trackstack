import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import axios from 'axios';

const API_BASE = 'http://localhost:8080'; // Change to Fly URL in prod

const Login = () => {
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [isRegister, setIsRegister] = createSignal(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const endpoint = isRegister() ? '/register' : '/login';
            const res = await axios.post(`${API_BASE}${endpoint}`, { email: email(), password: password() });
            if (!isRegister()) {
                localStorage.setItem('token', res.data.token);
                navigate('/app/dashboard');
            } else {
                alert('Registered! Please login.');
                setIsRegister(false);
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data || err.message));
        }
    };

    return (
        <div class="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
            <div class="bg-[var(--color-card)] p-8 rounded-lg shadow-md max-w-md w-full">
                <h1 class="text-2xl font-bold text-[var(--color-secondary)] mb-6 text-center">
                    {isRegister() ? 'Register' : 'Login'}
                </h1>
                <input
                    type="email"
                    placeholder="Email"
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    class="w-full px-4 py-2 mb-4 bg-[var(--color-neutral)] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-secondary)]"
                />
                <input
                    type="password"
                    placeholder="Password"
                    onInput={(e) => setPassword(e.currentTarget.value)}
                    class="w-full px-4 py-2 mb-6 bg-[var(--color-neutral)] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-secondary)]"
                />
                <button
                    onClick={handleSubmit}
                    class="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    {isRegister() ? 'Register' : 'Login'}
                </button>
                <button
                    onClick={() => setIsRegister(!isRegister())}
                    class="w-full mt-4 text-[var(--color-primary)] hover:underline"
                >
                    {isRegister() ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </div>
        </div>
    );
};

export default Login;
