"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";

type AttendanceRecord = {
  id: string;
  student: string;
  teacher_name: string;
  subject: string;
  join_time: string;
  join_date: string;
};

export default function AttendanceTable({ data }: { data: AttendanceRecord[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Join Time</TableHead>
            <TableHead>Join Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.student}</TableCell>
                <TableCell>{record.teacher_name}</TableCell>
                <TableCell>{record.subject}</TableCell>
                <TableCell>
                  {new Date(record.join_time).toLocaleTimeString()}
                </TableCell>
                <TableCell>{record.join_date}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No attendance records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
