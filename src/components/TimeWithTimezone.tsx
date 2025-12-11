"use client";

import { useState, useEffect, useRef } from "react";
import moment from "moment-timezone";

type Props = {
  value?: string;               // UTC time HH:MM
  timezone?: string;            // e.g., "Asia/Karachi"
  onChange?: (utcTime: string) => void;
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

  // UTC → Selected Timezone
  useEffect(() => {
    if (!value || isUserInput.current) return;

    const [utcH, utcM] = value.split(":").map(Number);

    // UTC time → moment object → local timezone
    const local = moment.tz({ hour: utcH, minute: utcM }, "UTC").tz(timezone);

    const h12 = local.format("hh"); // 12-hour format
    const min = local.format("mm");
    const p = local.format("A");

    setHour(h12);
    setMinute(min);
    setPeriod(p);
  }, [value, timezone]);

  // Selected Timezone → UTC
  useEffect(() => {
    if (!isUserInput.current) return;

    const h = Number(hour);
    const m = Number(minute);

    // Local time in selected timezone
    const localTime = moment.tz(`${h}:${m} ${period}`, "hh:mm A", timezone);
    const utcTime = localTime.clone().tz("UTC").format("HH:mm");

    onChange(utcTime);
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
