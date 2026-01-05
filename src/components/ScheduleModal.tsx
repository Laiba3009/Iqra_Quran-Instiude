"use client";

import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import moment from "moment-timezone";
import { useMemo, useState } from "react";

/* ================= TYPES ================= */
interface ClassDay {
  day: string;
  subject: string;
  time: string; // "HH:mm" — PK time saved in DB
}

interface ScheduleModalProps {
  studentName: string;
  timezone: string; // student timezone e.g. "Asia/Karachi"
  classDays: ClassDay[];
}
function formatTimeForUser(timePK: string, timezone: string) {
  if (!timePK) return "—";

  // Parse PK time as today in PKT
  const pkMoment = moment.tz(timePK, "HH:mm", "Asia/Karachi");

  // Convert to student timezone
  return pkMoment.clone().tz(timezone).format("hh:mm A");
}

function formatPKTime(timePK: string) {
  if (!timePK) return "—";

  return moment.tz(timePK, "HH:mm", "Asia/Karachi").format("hh:mm A");
}



/* ================= COMPONENT ================= */
export default function ScheduleModal({
  studentName,
  timezone,
  classDays,
}: ScheduleModalProps) {
  const [open, setOpen] = useState(false);

  /* ================= GROUP BY DAY ================= */
  const groupedByDay = useMemo(() => {
    const map: Record<string, ClassDay[]> = {};
    classDays.forEach((cls) => {
      if (!map[cls.day]) map[cls.day] = [];
      map[cls.day].push(cls);
    });
    return map;
  }, [classDays]);

  /* ================= UI ================= */
  return (
    <>
      {/* BUTTON */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
      >
        View Schedule
      </Button>

      {/* MODAL */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
          <Dialog.Title className="text-lg font-bold text-green-700">
            Class Schedule
          </Dialog.Title>

          <p className="text-sm text-gray-700">
            <b>Student:</b> {studentName}
          </p>

          {/* DAYS */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedByDay).length > 0 ? (
              Object.keys(groupedByDay).map((day) => (
                <div key={day} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-green-700 mb-2">{day}</h3>

                  <div className="space-y-2">
                    {groupedByDay[day].map((cls, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm border-b pb-1 last:border-b-0"
                      >
                        <span className="font-medium text-gray-800">
                          {cls.subject}
                        </span>

                        <div className="text-right text-gray-700">
                          <div><p>🇵🇰 {formatPKTime(cls.time)}</p>
              <p>🌍{formatTimeForUser(cls.time, timezone || "Asia/Karachi")}</p>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No schedule available</p>
            )}
          </div>

          {/* CLOSE */}
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
