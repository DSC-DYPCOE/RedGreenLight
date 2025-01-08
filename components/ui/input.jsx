import * as React from "react"

import { cn } from "@/lib/utils"

const Input = ({ value, onChange, placeholder, disabled = false }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full bg-gray-700 p-4 rounded-lg text-center text-lg ${disabled ? "cursor-not-allowed" : ""}`}
    disabled={disabled}
  />
);

export default Input;

