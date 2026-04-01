import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import CurrencyConverter from "./CurrencyConverter"
import ListPage from "./ListPage"
import Calculator from "./Calculator"
import MoodPicker from "./MoodPicker"
import "./App.css"

const MainHeader = () => (
  <header className="main-header">
    <nav>
      <Link to="/">Converter</Link>
      <Link to="/list">List Demo</Link>
      <Link to="/calculator">Calculator</Link>
      <Link to="/moodpicker">Mood picker</Link>
    </nav>
  </header>
)

const ScrollHeader = () => (
  <header className="scroll-header">
    <nav>
      <Link to="/">Converter</Link>
      <Link to="/list">List Demo</Link>
      <Link to="/calculator">Calculator</Link>
      <Link to="/moodpicker">Mood picker</Link>
    </nav>
  </header>
)

const App = () => {
  const [showScrollHeader, setShowScrollHeader] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY

    // scrolli thresholdit, on main-header ja "scroll-header", jos scrollaa alas, main header häviää, ja scroll header ilmestyy.
    const SHOW_THRESHOLD = 150
    const HIDE_THRESHOLD = 130
    const SCROLL_DELTA = 20

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY

      if (currentScrollY > SHOW_THRESHOLD && diff > SCROLL_DELTA) {
        setShowScrollHeader(true)
      } else if (currentScrollY < HIDE_THRESHOLD) {
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
        <Route path="/moodpicker" element={<MoodPicker />} />
      </Routes>
      <div style={{ height: "1500px" }}></div>
    </BrowserRouter>
  )
}

export default App
