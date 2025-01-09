"use client";

import { useState, useEffect } from "react";

export default function SlotPage({ params }) {
  const [light, setLight] = useState("red");
  const [inputDisabled, setInputDisabled] = useState(true);

  useEffect(() => {
    const fetchLight = async () => {
      const res = await fetch("/api/light");
      const data = await res.json();
      setLight(data.light);
      setInputDisabled(data.light === "red");
    };
    fetchLight();

    const interval = setInterval(fetchLight, 1000); // Poll every second
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Slot: {params.slotId}</h1>
      <div
        className={`w-20 h-20 rounded-full ${
          light === "green" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <input
        type="text"
        disabled={inputDisabled}
        placeholder={inputDisabled ? "Wait for Green Light" : "Type here..."}
        className="mt-6 border p-2 w-1/2"
      />
    </main>
  );
}
