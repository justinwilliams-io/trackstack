import { createSignal, onMount, createMemo, For } from 'solid-js';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'solid-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.color = '#ffffff';

const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } }, // Hide legend as in screenshot
};

const API_BASE = 'http://localhost:8080';

export const Dashboard = () => {
    const [month, setMonth] = createSignal('August 2025'); // Stub month selector
    const [groups, setGroups] = createSignal<Group[]>([
        {
            name: 'Income for August', lineItems: [
                { name: 'CPC Payroll 1', planned: 4192.40, received: 4192.40 },
                { name: 'CPC Payroll 2', planned: 4192.39, received: 4192.39 },
                { name: 'Midwest Volleyball Warehouse 1', planned: 1015.63, received: 1015.63 },
                { name: 'Midwest Volleyball Warehouse 2', planned: 1100.00, received: 0.00 },
                { name: 'Northern Lights', planned: 466.29, received: 466.29 },
                { name: 'Northern Lights Bonus', planned: 688.80, received: 688.80 },
            ], isOpen: true, color: '#22c55e'
        }, // Green for income
        {
            name: 'Giving', lineItems: [
                { name: 'Charity', planned: 500, spent: 300 },
            ], isOpen: true, color: '#3b82f6'
        }, // Blue
        {
            name: 'Savings / Investments', lineItems: [
                { name: 'Emergency Fund', planned: 0, spent: 1000 },
                { name: 'Vacation', planned: 0, spent: 2110.75 },
            ], isOpen: true, color: '#ef4444'
        }, // Red
        {
            name: 'Housing', lineItems: [
                { name: 'Mortgage/Rent', planned: 1200, spent: 1200 },
                { name: 'Utilities', planned: 200, spent: 180 },
            ], isOpen: true, color: '#10b981'
        }, // Green
        {
            name: 'Food', lineItems: [
                { name: 'Groceries', planned: 400, spent: 350 },
                { name: 'Restaurants', planned: 150, spent: 200 },
            ], isOpen: true, color: '#f59e0b'
        }, // Orange
        {
            name: 'Transportation', lineItems: [
                { name: 'Gas', planned: 100, spent: 80 },
                { name: 'Car Payment', planned: 300, spent: 300 },
            ], isOpen: true, color: '#6366f1'
        }, // Indigo
        {
            name: 'Personal', lineItems: [
                { name: 'Clothing', planned: 100, spent: 50 },
                { name: 'Medical', planned: 150, spent: 100 },
            ], isOpen: true, color: '#ec4899'
        }, // Pink
        {
            name: 'Lifestyle', lineItems: [
                { name: 'Entertainment', planned: 100, spent: 120 },
                { name: 'Subscriptions', planned: 50, spent: 50 },
            ], isOpen: true, color: '#eab308'
        }, // Yellow
        {
            name: 'Insurance & Tax', lineItems: [
                { name: 'Health Insurance', planned: 200, spent: 200 },
                { name: 'Car Insurance', planned: 100, spent: 100 },
                { name: 'Taxes', planned: 300, spent: 250 },
            ], isOpen: true, color: '#22c55e'
        }, // Green
        {
            name: 'Debt', lineItems: [
                { name: 'Credit Card', planned: 200, spent: 150 },
                { name: 'Student Loan', planned: 300, spent: 300 },
                { name: 'Other Debt', planned: 100, spent: 80 },
            ], isOpen: true, color: '#ef4444'
        }, // Red
    ]);

    const [subs, setSubs] = createSignal<Subscription[]>([]);
    const [newLineItemName, setNewLineItemName] = createSignal('');
    const [selectedGroupForLineItem, setSelectedGroupForLineItem] = createSignal('');
    const [newTransactionName, setNewTransactionName] = createSignal('');
    const [newTransactionAmount, setNewTransactionAmount] = createSignal(0);
    const [selectedGroupForTransaction, setSelectedGroupForTransaction] = createSignal('');
    const [selectedLineItemForTransaction, setSelectedLineItemForTransaction] = createSignal('');

    onMount(async () => {
        await fetchSubscriptions();
        // Auto-add subscription spend to 'Subscriptions' line item in Lifestyle
        const subscriptionSpend = subs().reduce((acc, sub) => acc + sub.cost, 0);
        setGroups(groups().map(g => g.name === 'Lifestyle' ? { ...g, lineItems: g.lineItems.map(i => i.name === 'Subscriptions' ? { ...i, spent: subscriptionSpend } : i) } : g));
    });

    const fetchSubscriptions = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_BASE}/api/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubs(res.data);
        } catch (err) {
            alert('Error fetching: ' + err.message);
        }
    };

    const toggleGroup = (groupName: string) => {
        setGroups(groups().map(g => g.name === groupName ? { ...g, isOpen: !g.isOpen } : g));
    };

    const addLineItem = (groupName: string) => {
        if (newLineItemName()) {
            setGroups(groups().map(g => g.name === groupName ? { ...g, lineItems: [...g.lineItems, { name: newLineItemName(), planned: 0, received: 0, spent: 0 }] } : g));
            setNewLineItemName('');
        }
    };

    const updatePlanned = (groupName: string, itemName: string, planned: number) => {
        setGroups(groups().map(g => g.name === groupName ? { ...g, lineItems: g.lineItems.map(i => i.name === itemName ? { ...i, planned } : i) } : g));
    };

    const updateReceivedOrSpent = (groupName: string, itemName: string, value: number) => {
        setGroups(groups().map(g => g.name === groupName ? { ...g, lineItems: g.lineItems.map(i => i.name === itemName ? { ...i, [g.name === 'Income for August' ? 'received' : 'spent']: value } : i) } : g));
    };

    // Computed totals
    const totalIncomePlanned = createMemo(() => groups()[0].lineItems.reduce((acc, item) => acc + item.planned, 0));
    const totalIncomeReceived = createMemo(() => groups()[0].lineItems.reduce((acc, item) => acc + item.received, 0));
    const totalPlannedExpenses = createMemo(() => groups().slice(1).reduce((acc, g) => acc + g.lineItems.reduce((acc2, i) => acc2 + i.planned, 0), 0));
    const totalSpent = createMemo(() => groups().slice(1).reduce((acc, g) => acc + g.lineItems.reduce((acc2, i) => acc2 + i.spent, 0), 0));
    const leftToBudget = createMemo(() => (totalIncomeReceived() - totalPlannedExpenses()).toFixed(2));

    // Pie data for expenses by group
    const expenseData = createMemo(() => ({
        labels: groups().slice(1).map(g => g.name),
        datasets: [{
            data: groups().slice(1).map(g => g.lineItems.reduce((acc, i) => acc + i.spent, 0)),
            backgroundColor: groups().slice(1).map(g => g.color),
        }],
    }));

    // Category summaries for sidebar
    const categorySummaries = createMemo(() => groups().slice(1).map(g => ({
        name: g.name,
        planned: g.lineItems.reduce((acc, i) => acc + i.planned, 0),
        spent: g.lineItems.reduce((acc, i) => acc + i.spent, 0),
        remaining: g.lineItems.reduce((acc, i) => acc + (i.planned - i.spent), 0),
        color: g.color,
        percent: ((g.lineItems.reduce((acc, i) => acc + i.spent, 0) / totalSpent()) * 100).toFixed(0),
    })));

    return (
        <div class="flex">
            {/* Main budget content */}
            <div class="flex-1 p-6">
                <div class="flex justify-between mb-4">
                    <h1 class="text-2xl font-bold text-[var(--color-secondary)]">{month()} ▼</h1>
                    <span class="text-lg text-[var(--color-success)]">${leftToBudget()} left to budget</span>
                </div>

                {/* Groups */}
                <For each={groups()}>
                    {(group) => (
                        <div class="mb-4 bg-[var(--color-neutral)] rounded-md">
                            <button
                                onClick={() => toggleGroup(group.name)}
                                class="w-full flex justify-between p-3 text-lg font-semibold text-[var(--color-secondary)] border-b border-gray-700"
                            >
                                <span class={group.name === 'Income for August' ? 'text-[var(--color-success)]' : ''}>{group.name} ▼</span>
                                <span>Planned   {group.name === 'Income for August' ? 'Received' : 'Remaining'}</span>
                            </button>
                            {group.isOpen && (
                                <div>
                                    <For each={group.lineItems}>
                                        {(item) => (
                                            <div class="flex justify-between p-3 border-b border-gray-700 text-[var(--color-textLight)]">
                                                <span>{item.name}</span>
                                                <span class="flex space-x-4">
                                                    <input
                                                        type="number"
                                                        value={item.planned}
                                                        onInput={(e) => updatePlanned(group.name, item.name, parseFloat(e.currentTarget.value))}
                                                        class="w-24 bg-transparent text-right"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={group.name === 'Income for August' ? item.received : item.spent}
                                                        onInput={(e) => updateReceivedOrSpent(group.name, item.name, parseFloat(e.currentTarget.value))}
                                                        class="w-24 bg-transparent text-right"
                                                    />
                                                </span>
                                            </div>
                                        )}
                                    </For>
                                    <button class="p-3 text-[var(--color-primary)] hover:underline">Add {group.name === 'Income for August' ? 'Income' : 'Item'}</button>
                                </div>
                            )}
                        </div>
                    )}
                </For>
            </div>

            {/* Sidebar */}
            <div class="w-1/3 p-6 border-l border-gray-700">
                <div class="flex justify-between mb-4 text-[var(--color-textLight)]">
                    <span>Summary</span>
                    <span>Transactions</span>
                    <span>Accounts</span>
                </div>
                <div class="mb-6">
                    <Pie data={expenseData()} options={chartOptions} />
                    <div class="text-center text-2xl font-bold text-[var(--color-secondary)] mt-4">INCOME $11,655</div>
                </div>
                <div class="space-y-2">
                    <div class="grid grid-cols-3 text-[var(--color-textLight)] font-semibold">
                        <span>Planned</span>
                        <span>Spent</span>
                        <span>Remaining</span>
                    </div>
                    <For each={categorySummaries()}>
                        {(cat) => (
                            <div class="grid grid-cols-3 text-[var(--color-textLight)]">
                                <span class={cat.color ? `text-${cat.color.replace('bg-', '')}` : ''}>{cat.name} {cat.percent}%</span>
                                <span>${cat.planned}</span>
                                <span>${cat.spent}</span>
                                <span>${cat.remaining}</span>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};

interface Group {
    name: string;
    lineItems: LineItem[];
    isOpen: boolean;
    color?: string;
}

interface LineItem {
    name: string;
    planned: number;
    received?: number;
    spent?: number;
}

interface Subscription {
    ID: number;
    Name: string;
    Cost: number;
    RenewalDate: string;
    Frequency: string;
}
