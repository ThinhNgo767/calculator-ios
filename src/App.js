import "./App.css";
import Calculator from "./Calculator";
import CurrencyConversion from "./CurrencyConversion";

import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/currency" element={<CurrencyConversion />} />
      </Routes>
    </div>
  );
}

export default App;
