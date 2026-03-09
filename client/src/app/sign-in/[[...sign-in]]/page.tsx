'use client';

import { SignIn } from '@clerk/nextjs';
import { Building2 } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] relative overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4 shadow-sm">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Kirtane &amp; Pandit LLP</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide">Audit Management System</p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="card p-8 bg-white shadow-xl border-slate-100">
          <SignIn path="/sign-in" routing="path" />
        </div>
      </div>
    </div>
  );
}
