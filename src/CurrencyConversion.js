import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

import CustomSelect from "./CustomSelect";

// Khuyến khích đưa API key vào file .env trong thực tế
const apiKey = "99b6d341aab97b4d818dcbcf";

export default function CurrencyConversion() {
  const [listCurrency] = useState([
    { id: 1, cur: "USD", ctry: "Mỹ" },
    { id: 2, cur: "THB", ctry: "Thái Lan" },
    { id: 3, cur: "EUR", ctry: "Euro" },
    { id: 4, cur: "CNY", ctry: "Trung Quốc" },
    { id: 5, cur: "HKD", ctry: "Hồng Kông" },
    { id: 6, cur: "SGD", ctry: "Singapore" },
    { id: 7, cur: "JPY", ctry: "Nhật Bản" },
    { id: 8, cur: "KRW", ctry: "Hàn Quốc" },
    { id: 9, cur: "VND", ctry: "Việt Nam" },
  ]);

  const [base, setBase] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("VND"); // Renamed for clarity
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);

  const { isFetching, error, refetch } = useQuery({
    queryKey: ["currency", base, targetCurrency],
    queryFn: () =>
      fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${targetCurrency}`,
      ).then((res) => {
        if (!res.ok) throw new Error("Lỗi kết nối mạng");
        return res.json();
      }),
    enabled: false, // Only fetch on user command
  });

  const handleConvert = async () => {
    if (!base || !targetCurrency || !input) return;

    const result = await refetch();

    if (result.isSuccess && result.data) {
      const rate = result.data.conversion_rate;
      setOutput(Number(input) * rate);
    }
  };

  const handleSwap = () => {
    setBase(targetCurrency);
    setTargetCurrency(base);
    setOutput(null);
  };

  if (error) return <div>Lỗi: {error.message}</div>;

  return (
    <>
      <Link to="/" className="back-calculator">
        Go back
      </Link>
      <div className="container-currentcy">
        <div className="transform">
          <CustomSelect
            data={listCurrency}
            value={base}
            onChange={(newVal) => {
              setBase(newVal);
              setOutput(null);
            }}
          />

          <button
            onClick={handleSwap}
            className="reverse"
            title="Đảo chiều tiền tệ"
          >
            ⇄
          </button>

          <CustomSelect
            data={listCurrency
              .toSorted((a, b) => b.id - a.id)
              .filter((c) => c.cur !== base)}
            value={targetCurrency}
            onChange={(newVal) => {
              setTargetCurrency(newVal);
              setOutput(null);
            }}
          />
        </div>

        <div className="data-trans">
          <input
            type="number"
            value={input}
            name="currency"
            onChange={(e) => {
              setInput(e.target.value);
              setOutput(null);
            }}
            placeholder="Nhập số tiền..."
          />
          <button onClick={handleConvert} disabled={isFetching || !input}>
            {isFetching ? "Đang xử lý..." : "Chuyển đổi"}
          </button>
        </div>

        <div className="result">
          {output !== null && !isFetching && (
            <p
              style={{
                color: "#ff9f0a",
                fontWeight: "bold",
                marginTop: "10px",
              }}
            >
              Kết quả: {output.toLocaleString()} {targetCurrency}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
