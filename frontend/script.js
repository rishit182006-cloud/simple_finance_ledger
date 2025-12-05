// State
const state = {
    transactions: [],
    balance: 0,
    income: 0,
    expense: 0
};

// Config Loading
function getConfig() {
    const savedUrl = localStorage.getItem('api_base_url');
    const savedKey = localStorage.getItem('api_key');

    return {
        BASE_URL: savedUrl || CONFIG.API_BASE_URL,
        API_KEY: savedKey || CONFIG.API_KEY
    };
}

// DOM Elements
const elements = {
    transactionList: document.getElementById('transactions-list'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    addBtn: document.getElementById('add-transaction-btn'),
    configBtn: document.getElementById('config-btn'),
    modal: document.getElementById('transaction-modal'),
    configModal: document.getElementById('config-modal'),
    closeModal: document.getElementById('close-modal'),
    closeConfig: document.getElementById('close-config'),
    form: document.getElementById('transaction-form'),
    configForm: document.getElementById('config-form'),
    apiUrlInput: document.getElementById('api-url'),
    apiKeyInput: document.getElementById('api-key'),
    // Views
    viewDashboard: document.getElementById('view-dashboard'),
    viewTransactions: document.getElementById('view-transactions'),
    navDashboard: document.getElementById('nav-dashboard'),
    navTransactions: document.getElementById('nav-transactions'),
    pageTitle: document.getElementById('page-title'),
    // Modal
    modalTitle: document.getElementById('modal-title'),
    txnIdInput: document.getElementById('txn-id')
};

// Utils
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getHeaders() {
    const { API_KEY } = getConfig();
    return {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
    };
}

// Navigation / Views
function switchView(viewName) {
    if (viewName === 'dashboard') {
        elements.viewDashboard.style.display = 'block';
        elements.viewTransactions.style.display = 'none';
        elements.navDashboard.classList.add('active');
        elements.navTransactions.classList.remove('active');
        elements.pageTitle.textContent = 'Dashboard';
    } else {
        elements.viewDashboard.style.display = 'none';
        elements.viewTransactions.style.display = 'block';
        elements.navDashboard.classList.remove('active');
        elements.navTransactions.classList.add('active');
        elements.pageTitle.textContent = 'Transactions';
    }
}

// API Calls
async function fetchTransactions() {
    const { BASE_URL } = getConfig();
    try {
        const response = await fetch(`${BASE_URL}/entries`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            if (response.status === 403) {
                alert("Authentication Failed: Check logic or config");
            }
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        // Backend returns oldest first usually, ensuring we reverse for newest first UI
        // Actually, let's sort by date if we want, but reverse is fine for simple ledger
        state.transactions = data.reverse();
        updateUI();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        elements.transactionList.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--danger-color);">Failed to load.</td></tr>`;
    }
}

async function saveTransaction(transaction, id = null) {
    const { BASE_URL } = getConfig();
    const url = id ? `${BASE_URL}/entries/${id}` : `${BASE_URL}/add`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(transaction)
        });

        if (response.ok) {
            closeModal();
            fetchTransactions(); // Refresh
        } else {
            const err = await response.json();
            alert(`Error: ${err.detail || 'Failed to save'}`);
        }
    } catch (error) {
        console.error("Error saving transaction:", error);
    }
}

async function deleteTransaction(id) {
    const { BASE_URL } = getConfig();
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
        const response = await fetch(`${BASE_URL}/entries/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (response.ok) {
            fetchTransactions();
        } else {
            alert("Failed to delete");
        }
    } catch (error) {
        console.error("Error deleting:", error);
    }
}

// UI Updates
function updateUI() {
    // Calculate Totals
    let income = 0;
    let expense = 0;

    state.transactions.forEach(txn => {
        // Backend doesn't have "type" explicitly in model shown, but we can infer or simpler: 
        // If amount is stored as native number.
        // Usually, for "income"/"expense" differentiation, we look at the category or logic.
        // OR the frontend form sends negative for expense?
        // Let's assume the user entered "Type" in form helps us denote sign.
        // Wait, the backend model `LedgerEntry` has: name, description, amount, date, category.
        // Standard ledger: negative = expense, positive = income.
        // I will ensure the Form sends negative value if Expense is selected.

        if (txn.amount >= 0) {
            income += txn.amount;
        } else {
            expense += Math.abs(txn.amount);
        }
    });

    state.balance = income - expense;

    // Update Cards
    if (elements.totalBalance) elements.totalBalance.textContent = formatCurrency(state.balance);
    if (elements.totalIncome) elements.totalIncome.textContent = formatCurrency(income);
    if (elements.totalExpense) elements.totalExpense.textContent = formatCurrency(expense);

    // Update Table
    if (elements.transactionList) {
        elements.transactionList.innerHTML = state.transactions.map(txn => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${txn.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${txn.description}</div>
                </td>
                <td>${txn.date}</td>
                <td><span style="background:var(--bg-color); padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight:500;">${txn.category}</span></td>
                <td class="${txn.amount >= 0 ? 'amount-positive' : 'amount-negative'}">
                    ${txn.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(txn.amount))}
                </td>
                <td>
                    <button class="action-btn" onclick="openModalForEdit(${txn.id})">
                        <span class="material-icons-round">edit</span>
                    </button>
                    <button class="action-btn delete" onclick="deleteTransaction(${txn.id})">
                        <span class="material-icons-round">delete</span>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Modal Handlers
function openModal() {
    elements.form.reset();
    elements.txnIdInput.value = ''; // Clear ID
    elements.modalTitle.textContent = "Add Transaction";
    document.getElementById('txn-date').valueAsDate = new Date(); // Default today
    elements.modal.classList.add('active');
}

function openModalForEdit(id) {
    const txn = state.transactions.find(t => t.id === id);
    if (!txn) return;

    elements.txnIdInput.value = txn.id;
    elements.modalTitle.textContent = "Edit Transaction";

    document.getElementById('txn-name').value = txn.name;
    document.getElementById('txn-description').value = txn.description;
    document.getElementById('txn-amount').value = Math.abs(txn.amount);
    document.getElementById('txn-date').value = txn.date;
    document.getElementById('txn-category').value = txn.category;
    document.getElementById('txn-type').value = txn.amount >= 0 ? 'income' : 'expense';

    elements.modal.classList.add('active');
}

function closeModal() { elements.modal.classList.remove('active'); }

function openConfigModal() {
    const { BASE_URL, API_KEY } = getConfig();
    elements.apiUrlInput.value = BASE_URL;
    elements.apiKeyInput.value = API_KEY;
    elements.configModal.classList.add('active');
}
function closeConfigModal() { elements.configModal.classList.remove('active'); }

// Event Listeners
elements.addBtn.addEventListener('click', openModal);
elements.closeModal.addEventListener('click', closeModal);
elements.configBtn.addEventListener('click', openConfigModal);
elements.closeConfig.addEventListener('click', closeConfigModal);

// Nav Listeners
elements.navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('dashboard');
});
elements.navTransactions.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('transactions');
});

// Close on outside click
elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) closeModal();
});

// Form Submits
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = elements.txnIdInput.value;
    const type = document.getElementById('txn-type').value;
    let amount = parseFloat(document.getElementById('txn-amount').value);

    // Adjust sign
    if (type === 'expense') {
        amount = -Math.abs(amount);
    } else {
        amount = Math.abs(amount);
    }

    const transaction = {
        name: document.getElementById('txn-name').value,
        description: document.getElementById('txn-description').value,
        amount: amount,
        date: document.getElementById('txn-date').value,
        category: document.getElementById('txn-category').value
    };

    saveTransaction(transaction, id ? parseInt(id) : null);
});

elements.configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = elements.apiUrlInput.value;
    const key = elements.apiKeyInput.value;

    localStorage.setItem('api_base_url', url);
    localStorage.setItem('api_key', key);

    closeConfigModal();
    fetchTransactions();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();
    switchView('dashboard'); // Default view
});
window.openModalForEdit = openModalForEdit;
window.deleteTransaction = deleteTransaction;
