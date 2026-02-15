import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function App() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    category: "",
  });

  const canCreateTransaction = useMemo(
    () => form.title && form.amount && form.date && form.category,
    [form]
  );

  async function fetchJson(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed (${res.status})`);
    }

    if (res.status === 204) {
      return null;
    }

    return res.json();
  }

  async function loadAll() {
    const [cats, txs, dash] = await Promise.all([
      fetchJson("/categories/"),
      fetchJson("/transactions/"),
      fetchJson("/dashboard/"),
    ]);

    setCategories(cats);
    setTransactions(txs);
    setDashboard(dash);

    if (!form.category && cats.length) {
      setForm((prev) => ({ ...prev, category: String(cats[0].id) }));
    }
  }

  useEffect(() => {
    loadAll().catch((error) => alert(error.message));
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    await fetchJson("/categories/", {
      method: "POST",
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    setNewCategory("");
    await loadAll();
  }

  async function addTransaction(e) {
    e.preventDefault();
    await fetchJson("/transactions/", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        category: Number(form.category),
      }),
    });

    setForm((prev) => ({
      ...prev,
      title: "",
      amount: "",
      notes: "",
    }));

    await loadAll();
  }

  async function deleteTransaction(id) {
    await fetchJson(`/transactions/${id}/`, { method: "DELETE" });
    await loadAll();
  }

  return (
    <div className="container">
      <h1>Expense Tracker</h1>
      <p className="small">React frontend + Django backend</p>

      <div className="grid">
        <section className="card">
          <h2>Month Total</h2>
          <div className="total">
            ${Number(dashboard?.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="small">
            {dashboard?.month_start} to {dashboard?.today}
          </p>
        </section>

        <section className="card">
          <h2>By Category</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.by_category || []).map((item) => (
                <tr key={item.category__name}>
                  <td>{item.category__name}</td>
                  <td>${Number(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card">
        <h2>Add Category</h2>
        <form className="row" onSubmit={addCategory}>
          <input
            placeholder="Category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
          />
          <button type="submit">Create</button>
        </form>
      </section>

      <section className="card">
        <h2>Add Transaction</h2>
        <form onSubmit={addTransaction}>
          <div className="row">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="row">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button type="submit" disabled={!canCreateTransaction}>
            Add Transaction
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.title}</td>
                <td>{tx.category_name}</td>
                <td>${Number(tx.amount).toFixed(2)}</td>
                <td>
                  <button className="danger" onClick={() => deleteTransaction(tx.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
