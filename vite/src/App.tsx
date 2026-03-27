import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import CurrencyConverter from "./CurrencyConverter"
import ListPage from "./ListPage"

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "10px" }}>
        <Link to="/">Converter</Link> |{" "}
        <Link to="/list">List Demo</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CurrencyConverter />} />
        <Route path="/list" element={<ListPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App