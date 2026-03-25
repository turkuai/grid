import { useEffect, useState } from "react";
import type { Rates, ApiResponse } from "./components/types";
import "./App.css";

export default function App() {
  const [rates, setRates] = useState<Rates>({});
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState<string>("EUR");
  const [to, setTo] = useState<string>("USD");

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/EUR")
      .then((res) => res.json())
      .then((data: ApiResponse) => {
        setRates(data.rates);
      });
  }, []);

  const convert = (): number => {
    if (!rates[from] || !rates[to]) return 0;
    return (amount / rates[from]) * rates[to];
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Currency Converter</h1>

        <div className="row-horizontal">
          <div className="field">
            <label>From:</label>
            <select
              value={from}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFrom(e.target.value)
              }
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          <button className="swap" onClick={swapCurrencies}>
            ⇄
          </button>

          <div className="field">
            <label>To:</label>
            <select
              value={to}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setTo(e.target.value)
              }
            >
              {Object.keys(rates).map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="amount">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(Number(e.target.value))
            }
          />
        </div>

        <h2>{convert().toFixed(2)} {to}</h2>
      </div>
    </div>
  );
}
