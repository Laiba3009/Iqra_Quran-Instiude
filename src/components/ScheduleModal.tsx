"use client";

import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import moment from "moment-timezone";
import { useMemo, useState } from "react";

/* ================= TYPES ================= */

interface ClassDay {
  day: string;
  subject: string;
  time: string; // HH:mm (PK time saved)
}

interface ScheduleModalProps {
  studentName: string;
  timezone: string; // student selected timezone
  classDays: ClassDay[];
}

/* ================= COMPONENT ================= */

export default function ScheduleModal({
  studentName,
  timezone,
  classDays,
}: ScheduleModalProps) {
  const [open, setOpen] = useState(false);

  /* ================= GROUP BY DAY ================= */
  // Monday sirf ek dafa aaye ga
  const groupedByDay = useMemo(() => {
    const map: Record<string, ClassDay[]> = {};
    classDays.forEach((cls) => {
      if (!map[cls.day]) map[cls.day] = [];
      map[cls.day].push(cls);
    });
    return map;
  }, [classDays]);

  /* ================= TIME CONVERTER ================= */
  // PK time → Student timezone
  const formatTime = (time: string, targetTz: string) => {
    if (!time) return "—";

    return moment
      .tz(time, "HH:mm", "Asia/Karachi") // 👈 SOURCE = PK
      .tz(targetTz)                      // 👈 CONVERT
      .format("hh:mm A");
  };

  /* ================= UI ================= */

  return (
    <>
      {/* SINGLE BUTTON (List me sirf ek button) */}
    <Button
  size="sm"
  variant="outline"
  onClick={() => setOpen(true)}
  className="
    bg-purple-600 
    text-white 
    border-purple-600
    hover:bg-purple-700 
    hover:border-purple-700
    transition-colors
  "
>
  View Schedule
</Button>


      {/* MODAL */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
          <Dialog.Title className="text-lg font-bold text-green-700">
            Class Schedule
          </Dialog.Title>

          <p className="text-sm text-gray-700">
            <b>Student:</b> {studentName}
          </p>

          {/* DAYS CARDS */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedByDay).length > 0 ? (
              Object.keys(groupedByDay).map((day) => (
                <div
                  key={day}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <h3 className="font-semibold text-green-700 mb-2">
                    {day}
                  </h3>

                  <div className="space-y-2">
                    {groupedByDay[day].map((cls, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm border-b pb-1 last:border-b-0"
                      >
                        <span className="font-medium text-gray-800">
                          {cls.subject}
                        </span>

                        <span className="text-right text-gray-700">
                          🌍 {formatTime(cls.time, timezone)} <br />
                          🇵🇰 {formatTime(cls.time, "Asia/Karachi")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No schedule available
              </p>
            )}
          </div>

          {/* CLOSE BUTTON */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}
