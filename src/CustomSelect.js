import React, { useState } from "react";
import { AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";

const CustomSelect = ({ data, value, onChange }) => {
  const [open, setOpen] = useState(false);

  // Dynamically find the selected option based on the parent's value
  const selectedOption = data.find((opt) => opt.cur === value) || data[0];

  const handleSelect = (option) => {
    onChange(option.cur);
    setOpen(false);
  };

  return (
    <div className="custom-select">
      <div className="selected" onClick={() => setOpen(!open)}>
        {selectedOption.cur}
      </div>

      {open && (
        <ul>
          {data.map((opt) => (
            <li key={opt.id} onClick={() => handleSelect(opt)}>
              <span>{opt.cur}</span> <small>( {opt.ctry} )</small>
            </li>
          ))}
        </ul>
      )}
      <button className="icon-arrow" onClick={() => setOpen((prev) => !prev)}>
        {open ? <AiFillCaretDown /> : <AiFillCaretUp />}
      </button>
    </div>
  );
};

export default CustomSelect;
