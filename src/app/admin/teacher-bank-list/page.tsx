'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BankRecord {
  id: string;
  teacher_name: string;
  roll_no: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

export default function TeacherBankList() {
  const [records, setRecords] = useState<BankRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teacher_bank_details')
      .select(`
        id,
        account_holder,
        bank_name,
        account_number,
        ifsc_code,
        teachers ( name, roll_no )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast({ title: '❌ Error', description: 'Failed to load records.' });
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      teacher_name: r.teachers?.name || '—',
      roll_no: r.teachers?.roll_no || '—',
      account_holder: r.account_holder,
      bank_name: r.bank_name,
      account_number: r.account_number,
      ifsc_code: r.ifsc_code,
    }));

    setRecords(formatted);
    setLoading(false);
  };

  // 🗑️ Delete record function
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this record?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('teacher_bank_details').delete().eq('id', id);

    if (error) {
      console.error(error);
      toast({ title: '❌ Error', description: 'Failed to delete record.' });
    } else {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast({ title: '✅ Deleted', description: 'Bank detail deleted successfully.' });
    }
  };

  const filtered = records.filter(
    (r) =>
      r.teacher_name.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <Card className="shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <CardTitle className="text-2xl font-bold text-green-700">
            🏦 Teacher Bank Details
          </CardTitle>
          <Input
            placeholder="🔍 Search by teacher name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-green-600 w-6 h-6" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              No bank details found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 rounded-lg text-sm">
                <thead className="bg-green-100 text-green-800 uppercase text-sm">
                  <tr>
                    <th className="p-3 border-b text-left">Teacher Name</th>
                    <th className="p-3 border-b text-center">Roll No</th>
                    <th className="p-3 border-b text-left">Account Holder</th>
                    <th className="p-3 border-b text-left">Bank Name</th>
                    <th className="p-3 border-b text-center">Account No</th>
                    <th className="p-3 border-b text-center">IFSC / IBAN</th>
                    <th className="p-3 border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, index) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-3 border-b text-gray-800 font-medium text-left">
                        {r.teacher_name}
                      </td>
                      <td className="p-3 border-b text-center text-gray-700">
                        {r.roll_no}
                      </td>
                      <td className="p-3 border-b text-gray-700 text-left">
                        {r.account_holder}
                      </td>
                      <td className="p-3 border-b text-gray-700 text-left">
                        {r.bank_name}
                      </td>
                      <td className="p-3 border-b text-center text-gray-700">
                        {r.account_number}
                      </td>
                      <td className="p-3 border-b text-center text-gray-700">
                        {r.ifsc_code}
                      </td>
                      <td className="p-3 border-b text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
