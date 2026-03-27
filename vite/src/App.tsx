import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Link  } from "react-router-dom"
import CurrencyConverter from "./CurrencyConverter"
import ListPage from "./ListPage"
import Calculator from "./Calculator"
import "./App.css"

const MainHeader = () => (
  <header className="main-header">
    <nav>
      <Link to="/">Converter</Link>
      <Link to="/list">List Demo</Link>
      <Link to="/calculator">Calculator</Link>
    </nav>
  </header>
)

const ScrollHeader = () => (
  <header className="scroll-header">
    <nav>
      <Link to="/">Converter</Link>
      <Link to="/list">List Demo</Link>
      <Link to="/calculator">Calculator</Link>
    </nav>
  </header>
)

const App = () => {
  const [showScrollHeader, setShowScrollHeader] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY

      const handleScroll = () => {
    const currentScrollY = window.scrollY
    const diff = currentScrollY - lastScrollY

    if (currentScrollY > 150 && diff > 20) {
      setShowScrollHeader(true)
    } else if (currentScrollY < 120) {
      setShowScrollHeader(false)
  }

  lastScrollY = currentScrollY
}

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <BrowserRouter>
        {!showScrollHeader && <MainHeader />}
        {showScrollHeader && <ScrollHeader />}
      <Routes>
        <Route path="/" element={<CurrencyConverter />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/calculator" element={<Calculator />} />
      </Routes> 
      <div style={{ height: "1500px" }}></div>
    </BrowserRouter>
  )
}

export default App