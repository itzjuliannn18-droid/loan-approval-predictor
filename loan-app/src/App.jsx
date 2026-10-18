import { useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SECTIONS = [
  {
    title: "👤 Personal details",
    fields: [
      { name: "Gender", label: "Gender", options: ["Male", "Female"] },
      { name: "Married", label: "Married", options: ["Yes", "No"] },
      { name: "Dependents", label: "Dependents", options: ["0", "1", "2", "3+"] },
      { name: "Education", label: "Education", options: ["Graduate", "Not Graduate"] },
      { name: "Self_Employed", label: "Self employed", options: ["No", "Yes"] },
    ],
  },
  {
    title: "💰 Financial details",
    fields: [
      { name: "ApplicantIncome", label: "Applicant income (monthly)", type: "number", min: 0 },
      { name: "CoapplicantIncome", label: "Co-applicant income (monthly)", type: "number", min: 0 },
      { name: "Credit_History", label: "Good credit history?", options: ["Yes", "No"] },
    ],
  },
  {
    title: "🏠 Loan details",
    fields: [
      { name: "LoanAmount", label: "Loan amount (in thousands)", type: "number", min: 1 },
      { name: "Loan_Amount_Term", label: "Loan term (months)", type: "number", min: 12 },
      { name: "Property_Area", label: "Property area", options: ["Urban", "Semiurban", "Rural"] },
    ],
  },
];

const GOOD = {
  Gender: "Male", Married: "Yes", Dependents: "0", Education: "Graduate",
  Self_Employed: "No", Property_Area: "Semiurban", Credit_History: "Yes",
  ApplicantIncome: "6000", CoapplicantIncome: "2000",
  LoanAmount: "120", Loan_Amount_Term: "360",
};
const RISKY = {
  ...GOOD, Education: "Not Graduate", Property_Area: "Rural",
  Credit_History: "No", ApplicantIncome: "2000", CoapplicantIncome: "0",
  LoanAmount: "250", Loan_Amount_Term: "120",
};

export default function App() {
  const [form, setForm] = useState(GOOD);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setResult(data);
      setHistory((h) =>
        [
          {
            ...data,
            amount: form.LoanAmount,
            income: Number(form.ApplicantIncome) + Number(form.CoapplicantIncome),
          },
          ...h,
        ].slice(0, 5)
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach the server. It may be starting up, so wait a minute and try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>🏦 Loan Approval Predictor</h1>
        <p>AI-powered eligibility check in seconds</p>
        <div className="badges">
          <span>Machine Learning</span>
          <span>Flask API</span>
          <span>React</span>
        </div>
      </header>

      <main>
        <form className="card" onSubmit={onSubmit}>
          <div className="presets">
            <span className="muted">Quick fill:</span>
            <button type="button" className="chip" onClick={() => setForm(GOOD)}>
              ✅ Good profile
            </button>
            <button type="button" className="chip" onClick={() => setForm(RISKY)}>
              ⚠️ Risky profile
            </button>
          </div>

          {SECTIONS.map((s) => (
            <fieldset key={s.title}>
              <legend>{s.title}</legend>
              <div className="grid">
                {s.fields.map((f) => (
                  <label key={f.name}>
                    <span>{f.label}</span>
                    {f.options ? (
                      <select name={f.name} value={form[f.name]} onChange={onChange}>
                        {f.options.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        inputMode="numeric"
                        name={f.name}
                        min={f.min}
                        required
                        value={form[f.name]}
                        onChange={onChange}
                      />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <button className="btn" disabled={loading}>
            {loading ? "Predicting..." : "Check eligibility"}
          </button>
        </form>

        <aside className="card result" aria-live="polite">
          <h2>Result</h2>

          {loading && (
            <p className="muted">
              Analyzing... (the first request can take up to a minute if the server was asleep)
            </p>
          )}
          {error && <div className="error">{error}</div>}
          {!result && !error && !loading && (
            <p className="muted">Your prediction will appear here.</p>
          )}

          {result && (
            <>
              <div
                className={`gauge ${result.approved ? "ok" : "no"}`}
                style={{ "--p": result.probability }}
              >
                <span>{result.probability}%</span>
              </div>
              <div className={`verdict ${result.approved ? "ok" : "no"}`}>
                {result.approved ? "✅ Likely Approved" : "❌ Likely Rejected"}
              </div>
              <p className="muted center">Approval probability</p>
            </>
          )}

          {history.length > 0 && (
            <>
              <h3>Recent checks</h3>
              <ul className="history">
                {history.map((h, i) => (
                  <li key={i}>
                    <span>{h.approved ? "✅" : "❌"} {h.probability}%</span>
                    <span className="muted">
                      Income {h.income} · Loan {h.amount}k
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <small className="muted note">
            Educational project. This is not a real bank decision.
          </small>
        </aside>
      </main>
    </div>
  );
}