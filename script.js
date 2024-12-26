class FinanceTracker {
    constructor(formSelector, listSelector) {
        this.form = document.querySelector(formSelector);
        this.list = document.querySelector(listSelector);
        this.clearBtn = document.getElementById('clearTransactions');
        this.isEditing = false;
        this.editingTransactionId = null;

        this.initEventListeners();
        this.loadTransactions();
    }

    initEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.clearBtn.addEventListener('click', this.clearAllTransactions.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.form);

        if (this.isEditing) {
            this.updateTransaction(formData);
        } else {
            const transaction = this.createTransaction(formData);
            this.addTransactionToList(transaction);
            this.saveTransaction(transaction);
        }

        this.form.reset();
        this.isEditing = false;
        this.editingTransactionId = null;
    }

    createTransaction(formData) {
        return {
            id: Date.now(),
            title: formData.get('title'),
            category: formData.get('category'),
            amount: formData.get('amount'),
            date: formData.get('date')
        };
    }

    addTransactionToList(transaction) {
        const row = document.createElement('tr');
        row.dataset.id = transaction.id;
        row.innerHTML = this.generateTransactionHTML(transaction);
        this.list.appendChild(row);
    }

    generateTransactionHTML(transaction) {
        const isIncome = transaction.category === 'income';
        const amountClass = isIncome;

        return `
            <td class="px-4 py-2">${transaction.title}</td>
            <td class="px-4 py-2 capitalize">${isIncome ? 'Pemasukan' : 'Pengeluaran'}</td>
            <td class="px-4 py-2 text-right ${amountClass}">
                Rp ${Number(transaction.amount).toLocaleString('id-ID')}
            </td>
            <td class="px-4 py-2">${transaction.date}</td>
            <td class="px-4 py-2 space-x-2">
                <button onclick="tracker.editTransaction(${transaction.id})" 
                        class="bg-blue-500 p-1 rounded text-white hover:bg-blue-700">
                    Edit
                </button>
                <button onclick="tracker.deleteTransaction(${transaction.id})" 
                        class="bg-red-500 p-1 rounded text-white hover:bg-red-700">
                    Hapus
                </button>
            </td>
        `;
    }

    saveTransaction(transaction) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.forEach(transaction => this.addTransactionToList(transaction));
    }

    deleteTransaction(id) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const updatedTransactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        this.list.innerHTML = '';
        this.loadTransactions();
    }

    clearAllTransactions() {
        localStorage.removeItem('transactions');
        this.list.innerHTML = '';
    }

    editTransaction(id) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const transaction = transactions.find(t => t.id === id);

        if (transaction) {
            this.isEditing = true;
            this.editingTransactionId = id;

            this.form.title.value = transaction.title;
            this.form.category.value = transaction.category;
            this.form.amount.value = transaction.amount;
            this.form.date.value = transaction.date;
        }
    }

    updateTransaction(formData) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const updatedTransactions = transactions.map(t => {
            if (t.id === this.editingTransactionId) {
                return {
                    ...t,
                    title: formData.get('title'),
                    category: formData.get('category'),
                    amount: formData.get('amount'),
                    date: formData.get('date'),
                };
            }
            return t;
        });

        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        this.list.innerHTML = '';
        this.loadTransactions();
    }
}

const tracker = new FinanceTracker('#transactionForm', '#transactionList');