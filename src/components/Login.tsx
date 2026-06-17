/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, Mail, FileText, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function Login({ users, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Kérjük, töltse ki az összes mezőt!');
      return;
    }

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      setError('Nem található felhasználó ezzel az e-mail címmel.');
      return;
    }

    if (matchedUser.password && matchedUser.password !== password) {
      setError('Hibás jelszó! Kérjük, próbálja újra.');
      return;
    }

    // Success login
    onLoginSuccess(matchedUser);
  };

  const handleQuickFill = (targetUser: User) => {
    setEmail(targetUser.email);
    setPassword(targetUser.password || '');
    setError(null);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Adminisztrátor';
      case 'beterjeszto':
        return 'Beterjesztő';
      case 'velemenyezo':
        return 'Véleményező';
      case 'jovahagyo':
        return 'Jóváhagyó';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100';
      case 'beterjeszto':
        return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'velemenyezo':
        return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
      case 'jovahagyo':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="login-layout">
      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg mb-4">
          <FileText className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">DocuReview</h2>
        <div className="mt-2 text-sm text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
          <p>Webes dokumentum korrektúrázó</p>
          <p>és jóváhagyó rendszer</p>
          <p className="mt-1 text-slate-500 font-semibold">[Teszt verzió!]</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" id="login-card">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                E-mail cím
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm placeholder-slate-400"
                  placeholder="pelda@vps.hu"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Jelszó
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm placeholder-********"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-slate-950 hover:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors cursor-pointer"
                id="submit-login"
              >
                Bejelentkezés
              </button>
            </div>
          </form>

          {/* Quick-fill testing panel */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-1.5 justify-center mb-4">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                Teszt Felhasználók (Gyors Belépés)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2" id="quick-login-pills">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFill(u)}
                  className={`flex flex-col items-start p-2.5 border rounded-xl text-left transition-all hover:shadow-xs cursor-pointer ${getRoleColor(
                    u.role
                  )}`}
                >
                  <span className="text-xs font-bold truncate w-full">{u.name}</span>
                  <span className="text-[10px] font-medium opacity-80 mt-0.5 truncate w-full">
                    {getRoleLabel(u.role)}
                  </span>
                  <span className="text-[9px] font-mono opacity-65 select-all font-semibold">
                    {u.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
