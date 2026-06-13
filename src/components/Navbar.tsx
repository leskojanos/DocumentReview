/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';
import { LogOut, FileText, Shield, UserCheck, Edit3, Settings, Server } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onShowDockerGuide: () => void;
}

export default function Navbar({ user, onLogout, onShowDockerGuide }: NavbarProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="w-3.5 h-3.5" />
            Adminisztrátor
          </span>
        );
      case 'beterjeszto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Edit3 className="w-3.5 h-3.5" />
            Beterjesztő
          </span>
        );
      case 'velemenyezo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <UserCheck className="w-3.5 h-3.5" />
            Véleményező
          </span>
        );
      case 'jovahagyo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileText className="w-3.5 h-3.5" />
            Jóváhagyó
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-950 block leading-tight">DocuReview</span>
              <span className="text-xs text-slate-500 font-medium">Dokumentum Véleményező Rendszer</span>
            </div>
          </div>

          {/* Connected User Information & Quick Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onShowDockerGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Docker & VPS Telepítési Útmutató"
              id="docker-guide-btn"
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Docker VPS Útmutató</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500 font-medium">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              {getRoleBadge(user.role)}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Kijelentkezés"
                id="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
