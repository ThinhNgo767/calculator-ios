// import React, { useState, useEffect, useRef } from "react";
// import "./App.css";

// import { HiBookOpen, HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";
// import { ImCheckboxChecked, ImCheckboxUnchecked, ImBin } from "react-icons/im";

// function App() {
//   const [input, setInput] = useState("");
//   const [history, setHistory] = useState(() => {
//     const saved = localStorage.getItem("ios_calculator_history");
//     return saved ? JSON.parse(saved) : [];
//   });
//   const [selectedSum, setSelectedSum] = useState(0);
//   const [lastOp, setLastOp] = useState(null);
//   const [isFinished, setIsFinished] = useState(false);
//   const [isOpenHistory, setIsOpenHistory] = useState(false);
//   const [checkedAll, setCheckedAll] = useState(false);
//   const [isEdited, setIsEdited] = useState(false);
//   const [idOperation, setIdOperation] = useState(null);
//   const [isChangeSign, setIsChangeSign] = useState(false);

//   const pressTimerRef = useRef(null);

//   // --- HÀM FORMAT HIỂN THỊ (VIỆT NAM STYLE) ---
//   const formatDisplay = (str) => {
//     if (!str) return "0";

//     // Tách chuỗi theo toán tử để format từng số riêng biệt
//     const parts = str.split(/([÷×\-+])/);

//     return parts
//       .map((part) => {
//         if (/[÷×\-+]/.test(part)) return ` ${part} `; // Thêm khoảng cách cho toán tử
//         if (!part) return "";

//         // Xử lý số thập phân và hàng nghìn
//         const [integer, decimal] = part.split(".");
//         const formattedInt = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

//         return decimal !== undefined
//           ? `${formattedInt},${decimal}`
//           : formattedInt;
//       })
//       .join("");
//   };

//   useEffect(() => {
//     localStorage.setItem("ios_calculator_history", JSON.stringify(history));
//   }, [history]);

//   useEffect(() => {
//     const sum = history
//       .filter((item) => item.checked)
//       .reduce((acc, curr) => acc + parseFloat(curr.result), 0);
//     setSelectedSum(sum);
//   }, [history]);

//   const handlePercentage = () => {
//     if (!input) return;

//     // Tìm số cuối cùng đang nhập (bao gồm cả số thập phân)
//     const tokens = input.split(/([÷×\-+])/);
//     let lastNumberStr = tokens.pop();

//     // Nếu token cuối là rỗng (người dùng vừa bấm toán tử xong rồi bấm %), thoát
//     if (lastNumberStr === "" && tokens.length > 0) return;

//     const lastNumber = parseFloat(lastNumberStr);
//     if (isNaN(lastNumber)) return;

//     const prefix = tokens.join(""); // Phần còn lại của biểu thức (ví dụ: "100+")
//     const operator = tokens[tokens.length - 1];

//     let percentValue;

//     // Kiểm tra ngữ cảnh: Nếu là phép cộng hoặc trừ
//     if (operator === "+" || operator === "-") {
//       // Tìm con số đứng trước toán tử đó (ví dụ: lấy số 100 trong "100+")
//       const previousNumberStr = tokens[tokens.length - 2];
//       const previousNumber = parseFloat(previousNumberStr);

//       if (!isNaN(previousNumber)) {
//         // Logic iOS: 100 + 10% = 100 + (100 * 0.1)
//         percentValue = (previousNumber * lastNumber) / 100;
//       } else {
//         percentValue = lastNumber / 100;
//       }
//     } else {
//       // Trường hợp nhân/chia hoặc chỉ có 1 số: x% = x / 100
//       percentValue = lastNumber / 100;
//     }

//     // Cập nhật lại input: Thay thế số cuối cùng bằng giá trị phần trăm đã tính
//     setInput(prefix + percentValue.toString());
//   };

//   const handleChangeSign = () => {
//     if (!input || input === "0") return;

//     // Tách chuỗi thành các phần (số và toán tử)
//     // Ví dụ: "100+50" -> ["100", "+", "50"]
//     const tokens = input.split(/([÷×\-+])/);
//     let lastToken = tokens.pop(); // Lấy số cuối cùng ("50")

//     if (lastToken === "" && tokens.length > 0) {
//       // Nếu người dùng vừa bấm toán tử xong (VD: "100+"), không làm gì hoặc đảo dấu số trước đó
//       return;
//     }

//     // Đảo dấu số cuối cùng
//     if (lastToken.startsWith("-")) {
//       lastToken = lastToken.slice(1); // Đang âm thành dương
//     } else {
//       lastToken = "-" + lastToken; // Đang dương thành âm
//     }

//     // Ghép lại chuỗi
//     const newReflectedInput = tokens.join("") + lastToken;
//     setInput(newReflectedInput);
//     setIsFinished(false);
//   };

//   const handleClick = (value) => {
//     const isNumber = /\d|\./.test(value);
//     const isOperator = /[÷×\-+]/.test(value);

//     if (value === "AC") {
//       setInput("");
//       setLastOp(null);
//       setIsFinished(false);
//     } else if (value === "C") {
//       setInput(input.slice(0, -1));
//       setIsFinished(false);
//     } else if (value === "%") {
//       handlePercentage();
//       setIsFinished(false);
//     } else if (value === "+/-") {
//       handleChangeSign();
//       setIsFinished(false);
//     } else if (value === "=") {
//       calculateResult();
//     } else if (isFinished) {
//       if (isNumber) {
//         setInput(value === "." ? "0." : value);
//         setLastOp(null);
//       } else if (isOperator) {
//         setInput(input + value);
//       }
//       setIsFinished(false);
//     } else {
//       // Ngăn chặn nhập nhiều dấu chấm trong một số
//       if (value === ".") {
//         const lastNumber = input.split(/[÷×\-+]/).pop();
//         if (lastNumber.includes(".")) return;
//         if (!lastNumber) {
//           setInput(input + "0.");
//           return;
//         }
//       }
//       setInput(input + value);
//     }
//   };

//   const calculateResult = () => {
//     try {
//       if (!input && !isFinished) return;

//       let expressionToEval = input.replace(/×/g, "*").replace(/÷/g, "/");

//       // Logic lặp lại phép tính cuối cùng (Constant Calculation)
//       if (isFinished && lastOp) {
//         expressionToEval = `${input}${lastOp.operator}${lastOp.operand}`;
//       } else {
//         const match = expressionToEval.match(/([+\-*/])(\d+\.?\d*)$/);
//         if (match) {
//           setLastOp({ operator: match[1], operand: match[2] });
//         }
//       }

//       // eslint-disable-next-line no-new-func
//       const evalResult = Function(
//         '"use strict";return (' + expressionToEval + ")",
//       )();
//       const finalResult = Number(evalResult.toFixed(10)).toString();

//       if (isEdited) {
//         // --- LOGIC CẬP NHẬT (EDIT) ---
//         const updatedHistory = history.map((op) => {
//           if (op.id === idOperation) {
//             // Trả về object đã cập nhật kết quả mới
//             return { ...op, expression: input, result: finalResult };
//           }
//           return op;
//         });

//         setHistory(updatedHistory);
//         setIsEdited(false); // Tắt chế độ chỉnh sửa
//         setIdOperation(null); // Xóa ID đang chọn
//       } else {
//         // --- LOGIC THÊM MỚI (NEW) ---
//         const newHistoryItem = {
//           id: Date.now(),
//           expression: input,
//           result: finalResult,
//           checked: false,
//         };
//         setHistory([newHistoryItem, ...history]);
//       }

//       // Cập nhật màn hình hiển thị sau khi tính (áp dụng cho cả Edit và New)
//       setInput(finalResult);
//       setIsFinished(true);
//     } catch (error) {
//       console.error("Lỗi tính toán:", error);
//       setInput("Error");
//       setIsFinished(false);
//     }
//   };

//   const toggleCheck = (id) => {
//     setHistory(
//       history.map((item) =>
//         item.id === id ? { ...item, checked: !item.checked } : item,
//       ),
//     );
//   };

//   const clearHistory = () => {
//     if (window.confirm("Xóa lịch sử?")) setHistory([]);
//   };

//   const handleSelected = (arr) => {
//     arr.map((item) => (item.checked = !item.checked));
//     setCheckedAll((prve) => !prve);
//     toggleCheck();
//   };

//   const handleOpenHistory = () => {
//     setIsOpenHistory((prve) => !prve);
//     if (!isOpenHistory) setInput("");
//   };

//   const handleEditOperation = (item) => {
//     setInput(item.expression);
//     setIdOperation(item.id);
//     setIsEdited(true);
//     setIsFinished(false);
//     setIsOpenHistory(false);
//     if (navigator.vibrate) navigator.vibrate(50);
//   };

//   const handleTouchStart = (item) => {
//     if (pressTimerRef.current) {
//       clearTimeout(pressTimerRef.current);
//     }
//     pressTimerRef.current = setTimeout(() => {
//       setInput(item.expression);
//       setIdOperation(item.id);
//       setIsEdited(true);
//       setIsFinished(false);
//       setIsOpenHistory(false);
//       if (navigator.vibrate) navigator.vibrate(50);
//     }, 600);
//   };
//   const handleTouchEnd = () => {
//     if (pressTimerRef.current) {
//       clearTimeout(pressTimerRef.current);
//       pressTimerRef.current = null;
//     }
//   };

//   // Nút hiển thị là dấu phẩy nhưng giá trị truyền vào là dấu chấm
//   const buttons = [
//     "AC",
//     "C",
//     "%",
//     "+/-",
//     "7",
//     "8",
//     "9",
//     "÷",
//     "4",
//     "5",
//     "6",
//     "×",
//     "1",
//     "2",
//     "3",
//     "-",
//     "0",
//     ".",
//     "=",
//     "+",
//   ];

//   return (
//     <div className="container">
//       {isOpenHistory ? (
//         <div className="history-section">
//           <div className="history-header">
//             <h3>Lịch sử</h3>
//             {history.length > 0 && (
//               <>
//                 <button onClick={clearHistory} className="clear-btn btn">
//                   <ImBin />
//                 </button>
//                 <button
//                   onClick={() => handleSelected(history)}
//                   className="clear-btn btn"
//                 >
//                   {checkedAll ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
//                 </button>
//               </>
//             )}
//             <button className="close-history btn" onClick={handleOpenHistory}>
//               <HiMiniArrowLeftStartOnRectangle />
//             </button>
//           </div>
//           <div className="summary-box">
//             <span>Tổng đã chọn:</span>
//             <strong>{formatDisplay(selectedSum.toFixed(2).toString())}</strong>
//           </div>
//           <div className="history-list">
//             {history.map((item) => (
//               <div key={item.id} className="history-item">
//                 <input
//                   type="checkbox"
//                   checked={item.checked}
//                   onChange={() => toggleCheck(item.id)}
//                   className="history-checkbox"
//                 />
//                 <div
//                   className="history-content"
//                   onDoubleClick={() => handleEditOperation(item)}
//                   onTouchStart={() => handleTouchStart(item)}
//                   onTouchEnd={handleTouchEnd}
//                   onTouchMove={handleTouchEnd}
//                 >
//                   <span className="hist-exp">
//                     {formatDisplay(item.expression)}
//                   </span>
//                   <span className="hist-res">
//                     = {formatDisplay(item.result)}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ) : (
//         <div className="calculator-wrapper">
//           <div className="display">
//             <button className="open-history btn" onClick={handleOpenHistory}>
//               <HiBookOpen />
//             </button>
//             <div className="input-text">{formatDisplay(input)}</div>
//           </div>
//           <div className="keypad">
//             {buttons.map((btn, i) => {
//               let className =
//                 "btn " +
//                 (["÷", "×", "-", "+", "="].includes(btn)
//                   ? "btn-orange"
//                   : ["AC", "C", "%", "+/-"].includes(btn)
//                     ? "btn-grey"
//                     : "btn-dark");
//               if (btn === "0") className += " btn-zero";
//               return (
//                 <button
//                   key={i}
//                   className={className}
//                   onClick={() => handleClick(btn)}
//                 >
//                   {btn === "." ? "," : btn}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import { HiBookOpen, HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";
import { ImCheckboxChecked, ImCheckboxUnchecked, ImBin } from "react-icons/im";

function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("ios_calculator_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSum, setSelectedSum] = useState(0);
  const [lastOp, setLastOp] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isOpenHistory, setIsOpenHistory] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [idOperation, setIdOperation] = useState(null);

  const pressTimerRef = useRef(null);

  const decimal = selectedSum.toString().includes(".");

  // --- FORMAT HIỂN THỊ VIỆT NAM ---
  const formatDisplay = (str) => {
    if (!str || str === "Error") return str || "0";

    const parts = str.split(/([÷×\-+])/);
    return parts
      .map((part) => {
        if (/[÷×\-+]/.test(part)) return ` ${part} `;
        if (!part) return "";

        const [integer, decimal] = part.split(".");
        const formattedInt = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        return decimal !== undefined
          ? `${formattedInt},${decimal}`
          : formattedInt;
      })
      .join("");
  };

  // --- LƯU LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem("ios_calculator_history", JSON.stringify(history));
  }, [history]);

  // --- TÍNH TỔNG CÁC MỤC ĐÃ CHỌN ---
  useEffect(() => {
    const sum = history
      .filter((item) => item.checked)
      .reduce((acc, curr) => acc + parseFloat(curr.result || 0), 0);
    setSelectedSum(sum);
  }, [history]);

  // --- XỬ LÍ CHECKED
  useEffect(() => {
    if (isOpenHistory) {
      // Nếu mảng history trống thì không cần chọn tất cả
      if (history.length === 0) {
        setCheckedAll(false);
        return;
      }

      const isAllChecked = history.every((item) => item.checked === true);

      setCheckedAll(isAllChecked);
    }
  }, [isOpenHistory, history]);

  // --- XỬ LÝ PHẦN TRĂM ---
  const handlePercentage = () => {
    if (!input) return;
    const tokens = input.split(/([÷×\-+])/);
    let lastNumberStr = tokens.pop();
    if (lastNumberStr === "" && tokens.length > 0) return;

    const lastNumber = parseFloat(lastNumberStr);
    if (isNaN(lastNumber)) return;

    const prefix = tokens.join("");
    const operator = tokens[tokens.length - 1];
    let percentValue;

    if (operator === "+" || operator === "-") {
      const previousNumber = parseFloat(tokens[tokens.length - 2]);
      percentValue = !isNaN(previousNumber)
        ? (previousNumber * lastNumber) / 100
        : lastNumber / 100;
    } else {
      percentValue = lastNumber / 100;
    }
    setInput(prefix + percentValue.toString());
  };

  // --- ĐẢO DẤU SỐ CUỐI CÙNG ---
  const handleChangeSign = () => {
    if (!input || input === "0") return;
    const tokens = input.split(/([÷×\-+])/);
    let lastToken = tokens.pop();

    if (lastToken === "" && tokens.length > 0) return;

    lastToken = lastToken.startsWith("-")
      ? lastToken.slice(1)
      : "-" + lastToken;
    setInput(tokens.join("") + lastToken);
  };

  // --- XỬ LÝ CLICK NÚT ---
  const handleClick = (value) => {
    const isNumber = /\d|\./.test(value);
    const isOperator = /[÷×\-+]/.test(value);
    const lastChar = input.slice(-1);
    const isLastCharOperator = /[÷×\-+]/.test(lastChar);

    if (value === "AC") {
      setInput("");
      setLastOp(null);
      setIsFinished(false);
      setIsEdited(false);
    } else if (value === "C") {
      setInput(input.slice(0, -1));
    } else if (value === "%") {
      handlePercentage();
    } else if (value === "+/-") {
      handleChangeSign();
    } else if (value === "=") {
      calculateResult();
    } else if (isOperator) {
      if (input === "" || isFinished) {
        setInput((isFinished ? input : "0") + value);
        setIsFinished(false);
      } else if (isLastCharOperator) {
        setInput(input.slice(0, -1) + value);
      } else {
        setInput(input + value);
      }
    } else if (isNumber) {
      if (isFinished) {
        setInput(value === "." ? "0." : value);
        setLastOp(null);
        setIsFinished(false);
      } else {
        // 1. Lấy con số hiện tại đang nhập (số cuối cùng trong chuỗi)
        const parts = input.split(/[÷×\-+]/);
        const lastNumber = parts[parts.length - 1];

        // 2. Kiểm tra giới hạn 9 ký tự số (không tính dấu chấm và dấu âm)
        const digitCount = lastNumber.replace(/[.-]/g, "").length;

        if (value !== ".") {
          // Nếu là số, chặn nếu đã đủ 9 chữ số
          if (digitCount >= 9) return;
        } else {
          // Nếu là dấu chấm, chặn nếu đã có dấu chấm rồi
          if (lastNumber.includes(".")) return;
          // Tự thêm "0." nếu bấm dấu chấm đầu tiên
          if (!lastNumber || lastNumber === "-") {
            setInput(input + "0.");
            return;
          }
        }

        setInput(input + value);
      }
    }
  };

  // --- TÍNH TOÁN KẾT QUẢ ---
  const calculateResult = () => {
    try {
      let currentInput = input;
      if (!currentInput && !isFinished) return;

      // 1. Xóa toán tử thừa ở cuối
      if (/[÷×\-+]/.test(currentInput.slice(-1))) {
        currentInput = currentInput.slice(0, -1);
      }

      let expressionToEval = currentInput.replace(/×/g, "*").replace(/÷/g, "/");

      // 2. Logic lặp lại phép tính cuối
      if (isFinished && lastOp) {
        expressionToEval = `${currentInput}${lastOp.operator}${lastOp.operand}`;
      } else {
        const match = expressionToEval.match(/([+\-*/])(\d+\.?\d*)$/);
        if (match) setLastOp({ operator: match[1], operand: match[2] });
      }

      // 3. Tính toán
      // eslint-disable-next-line no-new-func
      const evalResult = Function(
        '"use strict";return (' + expressionToEval + ")",
      )();

      // 4. XỬ LÝ ĐỘ DÀI 9 KÝ TỰ (CHÍNH)
      let finalResult;
      const resultStr = evalResult.toString();
      const digitCount = resultStr.replace(/[^0-9]/g, "").length; // Đếm chỉ các chữ số

      if (digitCount > 9) {
        if (
          Math.abs(evalResult) >= 1e9 ||
          (Math.abs(evalResult) < 1e-7 && evalResult !== 0)
        ) {
          // Nếu số quá lớn hoặc quá nhỏ: Chuyển sang dạng số mũ (e) nhưng vẫn giới hạn độ dài
          finalResult = evalResult.toPrecision(5).toString();
        } else {
          // Nếu là số thập phân dài: Giới hạn tổng cộng 9 chữ số có nghĩa
          finalResult = Number(evalResult.toPrecision(9)).toString();
        }
      } else {
        finalResult = resultStr;
      }

      // 5. Cập nhật lịch sử (giữ nguyên logic của bạn)
      if (isEdited) {
        setHistory((prev) =>
          prev.map((op) =>
            op.id === idOperation
              ? { ...op, expression: currentInput, result: finalResult }
              : op,
          ),
        );
        setIsEdited(false);
        setIdOperation(null);
      } else {
        const newHistoryItem = {
          id: Date.now(),
          expression: currentInput,
          result: finalResult,
          checked: false,
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      }

      // 6. Hiển thị kết quả
      setInput(finalResult);
      setIsFinished(true);
    } catch (error) {
      setInput("Error");
      setIsFinished(false);
    }
  };

  // --- QUẢN LÝ LỊCH SỬ ---
  const toggleCheck = (id) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleSelectedAll = () => {
    const nextCheckedState = !checkedAll;
    setHistory((prev) =>
      prev.map((item) => ({ ...item, checked: nextCheckedState })),
    );
    setCheckedAll(nextCheckedState);
  };

  const handleEditFromHistory = (item) => {
    setInput(item.expression);
    setIdOperation(item.id);
    setIsEdited(true);
    setIsFinished(false);
    setIsOpenHistory(false);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  // --- TOUCH EVENTS CHO NHẤN GIỮ ---
  const handleTouchStart = (item) => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => handleEditFromHistory(item), 600);
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const buttons = [
    "AC",
    "C",
    "%",
    "+/-",
    "7",
    "8",
    "9",
    "÷",
    "4",
    "5",
    "6",
    "×",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];

  return (
    <div className="container">
      {isOpenHistory ? (
        <div className="history-section">
          <div className="history-header">
            <h3>Lịch sử</h3>
            <div className="header-actions">
              <button
                onClick={() => setHistory([])}
                className="clear-btn btn"
                title="Xóa hết"
              >
                <ImBin />
              </button>
              <button onClick={handleSelectedAll} className="clear-btn btn">
                {checkedAll ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
              </button>
              <button
                onClick={() => setIsOpenHistory(false)}
                className="btn close-history-btn"
              >
                <HiMiniArrowLeftStartOnRectangle />
              </button>
            </div>
          </div>
          <div className="summary-box">
            <span>Tổng đã chọn:</span>
            <strong>
              {decimal
                ? formatDisplay(selectedSum.toFixed(2).toString())
                : formatDisplay(selectedSum.toString())}
            </strong>
          </div>
          <div className="history-list">
            {history.length === 0 && <p className="empty-msg">Trống</p>}
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="history-checkbox"
                />
                <div
                  className="history-content"
                  onDoubleClick={() => handleEditFromHistory(item)}
                  onTouchStart={() => handleTouchStart(item)}
                  onTouchEnd={handleTouchEnd}
                >
                  <span className="hist-exp">
                    {formatDisplay(item.expression)}
                  </span>
                  <span className="hist-res">
                    = {formatDisplay(item.result)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="calculator-wrapper">
          <div className="display">
            <div
              className="open-history"
              onClick={() => setIsOpenHistory(true)}
            >
              <button className="btn open-history-btn">
                <HiBookOpen />
              </button>
              <small className="history-text">history</small>
            </div>

            <div
              className={
                input.length > 9 ? "input-text text-max-length" : "input-text"
              }
            >
              {formatDisplay(input)}
            </div>
          </div>
          <div className="keypad">
            {buttons.map((btn, i) => {
              let className =
                "btn " +
                (["÷", "×", "-", "+", "="].includes(btn)
                  ? "btn-orange"
                  : ["AC", "C", "%", "+/-"].includes(btn)
                    ? "btn-grey"
                    : "btn-dark");
              if (btn === "0") className += " btn-zero";
              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => handleClick(btn)}
                >
                  {btn === "." ? "," : btn}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
