import "./App.css";
import DeviceFingerprint from "./utils/deviceFingerprint";

import React, { useState, useEffect, useRef } from "react";
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
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const pressTimerRef = useRef(null);

  const decimal = selectedSum.toString().includes(".");

  const { getDeviceID } = DeviceFingerprint;

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
    if (history.length === 0) return;
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

  const handleBackspace = () => {
    if (input.length > 0) {
      setInput(input.slice(0, -1)); // Cắt bỏ ký tự cuối cùng
      // Nếu xóa hết thì reset về trạng thái chưa xong để hiện số 0 nếu cần
      if (input.length === 1) {
        setIsFinished(false);
      }
    }
  };

  // Bắt đầu chạm
  const onTouchStartDisplay = (e) => {
    setTouchEnd(null); // Reset điểm kết thúc
    setTouchStart(e.targetTouches[0].clientX); // Lưu tọa độ ngang (X) ban đầu
  };

  // Di chuyển ngón tay (Cập nhật liên tục điểm cuối)
  const onTouchMoveDisplay = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Kết thúc chạm -> Tính toán
  const onTouchEndDisplay = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Vuốt sang trái > 50px
    const isRightSwipe = distance < -50; // Vuốt sang phải > 50px

    // iOS Calculator cho phép vuốt cả 2 bên đều là xóa
    if (isLeftSwipe || isRightSwipe) {
      handleBackspace();
      // Hiệu ứng rung nhẹ (Haptic) nếu có (Android)
      if (navigator.vibrate) navigator.vibrate(10);
    }
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
      handleBackspace();
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
          deviceId: getDeviceID(),
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
    "+/-",
    "%",
    "÷",
    "7",
    "8",
    "9",
    "×",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];

  const classInputText =
    input.length <= 7
      ? "input-text"
      : input.length > 7 && input.length < 9
        ? "input-text text-average-length"
        : "input-text text-max-length";

  return (
    <div className="container">
      {isOpenHistory ? (
        <div className="history-section">
          <div className="history-header">
            <div className="header-actions">
              <button
                onClick={() => setIsOpenHistory(false)}
                className="btn close-history-btn"
              >
                <HiMiniArrowLeftStartOnRectangle />
              </button>
              <button onClick={handleSelectedAll} className="clear-btn btn">
                {checkedAll ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
              </button>
              <button
                onClick={() => setHistory([])}
                className="clear-btn btn"
                title="Xóa hết"
              >
                <ImBin />
              </button>
            </div>
            <h3>Lịch sử</h3>
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
          <div
            className="display"
            onTouchStart={onTouchStartDisplay}
            onTouchMove={onTouchMoveDisplay}
            onTouchEnd={onTouchEndDisplay}
          >
            <div
              className="open-history"
              onClick={() => setIsOpenHistory(true)}
            >
              <button className="btn open-history-btn">
                <HiBookOpen />
              </button>
              <small className="history-text">history</small>
            </div>

            <div className={classInputText}>{formatDisplay(input)}</div>
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
