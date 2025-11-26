"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  value?: string;       // UTC time HH:MM
  onChange?: (utcTime: string) => void;
};

const PAKISTAN_OFFSET = 5; // Form hamesha Pakistan time me show

export default function TimeWithTimezone({ value, onChange = () => {} }: Props) {
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const isUserInput = useRef(false);

  // Convert UTC → Pakistan local time
  useEffect(() => {
    if (!value || isUserInput.current) return;

    const [utcH, utcM] = value.split(":").map(Number);

    let local = utcH + PAKISTAN_OFFSET;
    if (local >= 24) local -= 24;
    if (local < 0) local += 24;

    const newPeriod = local >= 12 ? "PM" : "AM";
    const h12 = local % 12 || 12;

    setHour(String(h12).padStart(2, "0"));
    setMinute(String(utcM).padStart(2, "0"));
    setPeriod(newPeriod);
  }, [value]);

  // Convert Pakistan local → UTC when user changes
  useEffect(() => {
    if (!isUserInput.current) return;

    let h = Number(hour);
    let m = Number(minute);

    let local24 = period === "PM" ? (h % 12) + 12 : h % 12;

    let utc = local24 - PAKISTAN_OFFSET;
    if (utc < 0) utc += 24;
    if (utc >= 24) utc -= 24;

    const utcTime = `${String(utc).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    onChange(utcTime);
  }, [hour, minute, period, onChange]);

  const handleChange = (setter: any) => (e: any) => {
    isUserInput.current = true;
    setter(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Hour */}
      <select value={hour} onChange={handleChange(setHour)} className="border p-1 rounded">
        {Array.from({ length: 12 }, (_, i) => {
          const h = String(i + 1).padStart(2, "0");
          return <option key={h}>{h}</option>;
        })}
      </select>

      {/* Minute */}
      <select value={minute} onChange={handleChange(setMinute)} className="border p-1 rounded">
        {["00", "15", "30", "45"].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>

      {/* AM/PM */}
      <select value={period} onChange={handleChange(setPeriod)} className="border p-1 rounded">
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
}
