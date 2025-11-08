'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherRulesPage() {
  return (
    <div className="p-6">
      <Card className="shadow-lg border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800">📜 Teacher Rules & Regulations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to the Teacher Rules & Regulations page. Please follow all the guidelines
            strictly to maintain a professional and productive environment.
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Arrive on time for classes and meetings.</li>
            <li>Maintain accurate attendance records for all students.</li>
            <li>Prepare and submit lesson plans regularly.</li>
            <li>Ensure that all classroom activities follow the school’s code of conduct.</li>
            <li>Communicate with parents and administration professionally.</li>
            <li>Maintain confidentiality of student information.</li>
            <li>Report any issues or concerns to the administration promptly.</li>
          </ul>

          <p className="text-gray-500 text-sm">
            These rules are mandatory for all teaching staff. Violation of rules may lead to
            administrative action.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
