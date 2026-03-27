import { useState } from "react"
import "./Calculator.css"

const Calculator = () => {
  const [input, setInput] = useState<string>("")   //syöttö/input
  const [result, setResult] = useState<string>("") //tulos

  const handleClick = (value: string) => {
    setInput((prev) => prev + value)
  }

//tyhjentää
  const handleClear = () => {
    setInput("")
    setResult("")
  }

  const handleCalculate = () => {
    try {
      const res = eval(input)
      setResult(res.toString())
    } catch (err) {
      setResult("Error")
    }
  }

  return (
    <div className="calculator-container">
      <div className="calculator-card">
        <h2>Simple Calculator</h2>

        <input
          type="text"
          value={input}
          readOnly
          className="calculator-display"
          placeholder="0"
        />
        <div style={{ textAlign: "right", marginBottom: "10px", fontSize: "18px", color: "#555" }}>
          {result}
        </div>

        <div className="calculator-buttons">
          {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map((val) => {
            if (val === "=") {
              return (
                <button key={val} className="calc-btn" onClick={handleCalculate}>
                  {val}
                </button>
              )
            } else {
              return (
                <button key={val} className="calc-btn" onClick={() => handleClick(val)}>
                  {val}
                </button>
              )
            }
          })}
          <button className="calc-btn clear-btn" onClick={handleClear}>
            C
          </button>
        </div>
      </div>
    </div>
  )
}

export default Calculator