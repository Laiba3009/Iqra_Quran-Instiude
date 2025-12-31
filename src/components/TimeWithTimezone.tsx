"use client";

import { useState, useEffect, useRef } from "react";
import moment from "moment-timezone";

type Props = {
  value?: string;               
  timezone?: string;            
  onChange?: (pkTime: string) => void; // DB mai PK time save karenge
};

export default function TimeWithTimezone({
  value,
  timezone = "Asia/Karachi",
  onChange = () => {},
}: Props) {
  const [hour, setHour] = useState("01");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  const isUserInput = useRef(false);

  // PK Time → Student Timezone
  useEffect(() => {
    if (!value || isUserInput.current) return;

    const local = moment.tz(value, "HH:mm", "Asia/Karachi").tz(timezone);

    setHour(local.format("hh"));
    setMinute(local.format("mm"));
    setPeriod(local.format("A"));
  }, [value, timezone]);

  // Student Timezone → PK Time
  useEffect(() => {
    if (!isUserInput.current) return;

    const h = Number(hour);
    const m = Number(minute);

    // User ka selected time jo student timezone mai hai → PK time
    const pkTime = moment.tz(`${h}:${m} ${period}`, "hh:mm A", timezone)
      .tz("Asia/Karachi")       // PK time mai convert
      .format("HH:mm");         // 24-hour format

    onChange(pkTime);           // DB mai PK time save karenge
  }, [hour, minute, period, timezone, onChange]);

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

      {/* Minute (increments of 5) */}
      <select value={minute} onChange={handleChange(setMinute)} className="border p-1 rounded">
        {Array.from({ length: 12 }, (_, i) => {
          const m = String(i * 5).padStart(2, "0"); // 0,5,10,...55
          return <option key={m}>{m}</option>;
        })}
      </select>

      {/* AM/PM */}
      <select value={period} onChange={handleChange(setPeriod)} className="border p-1 rounded">
        <option>AM</option>
        <option>PM</option>
      </select>
    </div>
  );
}
