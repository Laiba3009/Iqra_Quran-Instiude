'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RoleBasedLayout from '@/components/RoleBasedLayout';

function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export default function TeacherBankDetails() {
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<any>(null);
  const [form, setForm] = useState({
    account_holder: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
  });
  const [loading, setLoading] = useState(false);

  // 🔹 Load teacher info
  useEffect(() => {
    const roll = getCookie('teacher_roll');
    if (roll) loadTeacher(roll);
  }, []);

  const loadTeacher = async (rollNo: string) => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('roll_no', rollNo)
      .maybeSingle();

    if (!error && data) {
      setTeacher(data);
      loadBankDetails(data.id);
    }
  };

  // 🔹 Load existing bank details
  const loadBankDetails = async (teacherId: string) => {
    const { data, error } = await supabase
      .from('teacher_bank_details')
      .select('*')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (!error && data) setForm(data);
  };

  // 🔹 Save bank details
  const saveBankDetails = async () => {
    if (!teacher) return;
    setLoading(true);

    const payload = {
      teacher_id: teacher.id,
      account_holder: form.account_holder,
      bank_name: form.bank_name,
      account_number: form.account_number,
      ifsc_code: form.ifsc_code,
    };

    // upsert (insert or update)
    const { error } = await supabase.from('teacher_bank_details').upsert(payload, {
      onConflict: 'teacher_id',
    });

    setLoading(false);
    if (error) {
      toast({ title: '❌ Error', description: error.message });
    } else {
      toast({ title: '✅ Saved', description: 'Bank details updated successfully.' });
    }
  };

  if (!teacher) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <RoleBasedLayout role="teacher">
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-700">
              💳 Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Account Holder Name"
              value={form.account_holder}
              onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
            />
            <Input
              placeholder="Bank Name"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
            />
            <Input
              placeholder="Account Number"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
            />
            <Input
              placeholder="IFSC / IBAN Code"
              value={form.ifsc_code}
              onChange={(e) => setForm({ ...form, ifsc_code: e.target.value })}
            />
            <Button
              onClick={saveBankDetails}
              className="bg-green-600 text-white w-full"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Bank Details'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
