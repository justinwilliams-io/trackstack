import { createSignal, onMount, createMemo, For } from 'solid-js';
import axios from 'axios';
import Modal from './Modal';

const API_BASE = 'http://localhost:8080';

const Subscriptions = () => {
    const [subs, setSubs] = createSignal<Subscription[]>([]);
    const [isModalOpen, setModalOpen] = createSignal(false);
    const [newName, setNewName] = createSignal('');
    const [newCost, setNewCost] = createSignal(0);
    const [newRenewalDate, setNewRenewalDate] = createSignal('');
    const [newFrequency, setNewFrequency] = createSignal('monthly');

    onMount(async () => {
        await fetchSubscriptions();
    });

    const fetchSubscriptions = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_BASE}/api/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubs(res.data);
        } catch (err) {
            alert('Error fetching: ' + err);
        }
    };

    const handleAdd = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                `${API_BASE}/api/subscriptions`,
                { name: newName(), cost: newCost(), renewalDate: newRenewalDate(), frequency: newFrequency() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchSubscriptions();
            setModalOpen(false);
            setNewName('');
            setNewCost(0);
            setNewRenewalDate('');
            setNewFrequency('monthly');
        } catch (err) {
            alert('Error adding: ' + err);
        }
    };

    const handleDelete = async (id: number) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE}/api/subscriptions/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSubscriptions();
        } catch (err) {
            alert('Error deleting: ' + err);
        }
    };

    // Stats
    const monthlyTotal = createMemo(() => subs().reduce((acc, sub) => acc + sub.Cost, 0).toFixed(2));
    const yearlyTotal = createMemo(() => (parseFloat(monthlyTotal()) * 12).toFixed(2));

    // Current month's timeline (filtered/sorted renewals)
    const currentMonthRenewals = createMemo(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return subs()
            .filter(sub => {
                const renewal = new Date(sub.RenewalDate);
                return renewal >= firstDay && renewal <= lastDay;
            })
            .sort((a, b) => new Date(a.RenewalDate).getTime() - new Date(b.RenewalDate).getTime());
    });

    // Frequency colors
    const frequencyColors: Record<string, string> = {
        weekly: 'bg-blue-500',
        monthly: 'bg-green-500',
        quarterly: 'bg-yellow-500',
        annual: 'bg-purple-500',
    };

    return (
        <div>
            <h1 class="text-3xl font-bold text-[var(--color-secondary)] mb-4">Subscriptions</h1>

            {/* Stats compact */}
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <h2 class="text-lg text-[var(--color-textLight)]">Monthly Total</h2>
                    <p class="text-2xl font-bold text-[var(--color-secondary)]">${monthlyTotal()}</p>
                </div>
                <div>
                    <h2 class="text-lg text-[var(--color-textLight)]">Yearly Total</h2>
                    <p class="text-2xl font-bold text-[var(--color-secondary)]">${yearlyTotal()}</p>
                </div>
            </div>

            {/* Add button */}
            <button
                onClick={() => {
                    console.log('Button clicked - opening modal'); // Debug log
                    setModalOpen(true);
                }}
                class="mb-6 bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
                Add Subscription
            </button>

            {/* Timeline for current month */}
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-[var(--color-secondary)] mb-3">Current Month Renewals</h2>
                <ul class="space-y-4">
                    <For each={currentMonthRenewals()}>
                        {(sub) => (
                            <li class="flex items-center">
                                <div class={`w-4 h-4 rounded-full ${frequencyColors[sub.Frequency] || 'bg-gray-500'} mr-4`}></div>
                                <div class="flex-1">
                                    <p class="text-[var(--color-textLight)]">{sub.RenewalDate} - {sub.Name} (${sub.Cost})</p>
                                    <span class="text-sm text-[var(--color-success)]">{sub.Frequency}</span>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="text-[var(--color-primary)] hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(sub.ID)} class="text-red-500 hover:underline">Delete</button>
                                </div>
                            </li>
                        )}
                    </For>
                </ul>
            </div>

            {/* Modal for add - Wrapped in conditional */}
            {isModalOpen() && (
                <Modal isOpen={isModalOpen()} onClose={() => setModalOpen(false)}>
                    <h2 class="text-xl font-bold text-[var(--color-secondary)] mb-4">Add Subscription</h2>
                    <input
                        placeholder="Name"
                        onInput={(e) => setNewName(e.currentTarget.value)}
                        value={newName()}
                        class="w-full px-4 py-2 mb-4 bg-[var(--color-neutral)] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-secondary)]"
                    />
                    <input
                        type="number"
                        placeholder="Cost"
                        onInput={(e) => setNewCost(parseFloat(e.currentTarget.value))}
                        value={newCost()}
                        class="w-full px-4 py-2 mb-4 bg-[var(--color-neutral)] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-secondary)]"
                    />
                    <input
                        type="date"
                        onInput={(e) => setNewRenewalDate(e.currentTarget.value)}
                        value={newRenewalDate()}
                        class="w-full px-4 py-2 mb-4 bg-[var(--color-neutral)] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-secondary)]"
                    />
                    <select
                        onInput={(e) => setNewFrequency(e.currentTarget.value)}
                        value={newFrequency()}
                        class="w-full px-4 py-2 mb-6 bg-[var(--color-neutral)] border border-gray-700 rounded-md text-[var(--color-secondary)]"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                    </select>
                    <button
                        onClick={handleAdd}
                        class="w-full bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        Add
                    </button>
                </Modal>
            )}
        </div>
    );
};

interface Subscription {
    ID: number;
    Name: string;
    Cost: number;
    RenewalDate: string;
    Frequency: string;
}

export default Subscriptions;
