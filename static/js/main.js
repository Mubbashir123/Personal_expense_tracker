

  let expenseChart;


document.addEventListener('DOMContentLoaded', () => {
    fetchSummary();
    setupEventListeners();
});


function setupEventListeners() {
    document.getElementById('income-form')?.addEventListener('submit', handleIncomeSubmit);
    document.getElementById('expense-form')?.addEventListener('submit', handleExpenseSubmit);
    document.getElementById('saving-form')?.addEventListener('submit', handleSavingSubmit);
}


async function handleIncomeSubmit(e) {
    e.preventDefault();
    const amount = document.getElementById('income-amount').value;
    const source = document.getElementById('income-source').value;
    await addIncome(amount, source);
}


async function handleExpenseSubmit(e) {
    e.preventDefault();
    const amount = document.getElementById('expense-amount').value;
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;
    await addExpense(amount, category, description);
}


async function handleSavingSubmit(e) {
    e.preventDefault();
    const amount = document.getElementById('saving-amount').value;
    const description = document.getElementById('saving-description').value;
    await addSaving(amount, description);
}


async function fetchSummary() {
    const response = await fetch('/api/summary');
    const data = await response.json();
    updateSummaryUI(data);
    createExpenseChart(data.expense_by_category);
}


function updateSummaryUI(data) {
    document.getElementById('total-income').innerText = `$${data.total_income}`;
    document.getElementById('total-expenses').innerText = `$${data.total_expenses}`;
    document.getElementById('total-savings').innerText = `$${data.total_savings}`;

    updateRecentTransactions(data);
}


function updateRecentTransactions(data) {
    const recentList = document.getElementById('recent-list');
    recentList.innerHTML = '';
    
    [...data.recent_income, ...data.recent_expenses, ...data.recent_savings].forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.classList.add('transaction-item');
        
        let description = '';
        let amount = transaction.amount;
        
        if (transaction.source) {
            description = `Income from ${transaction.source}`;
        } else if (transaction.category) {
            description = `${transaction.category}: ${transaction.description}`;
        } else {
            description = transaction.description;
        }
        
        transactionItem.innerHTML = `
            <span>${description}</span>
            <span>$${amount}</span>
        `;
        recentList.appendChild(transactionItem);
    });
}

             // Create expense chart
function createExpenseChart(expenseData) {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (expenseChart) expenseChart.destroy();
    
    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(expenseData),
            datasets: [{
                data: Object.values(expenseData),
                backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF5733'],
            }]
        }
    });
}


async function addIncome(amount, source) {
    const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, source })
    });
    if (response.ok) {
        fetchSummary();
    }
}


async function addExpense(amount, category, description) {
    const response = await fetch('/api/expense', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, category, description })
    });
    if (response.ok) {
        fetchSummary();
    }
}


async function addSaving(amount, description) {
    const response = await fetch('/api/saving', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, description })
    });
    if (response.ok) {
        fetchSummary();
    }
}
