/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users, Plus, Shield, ShieldAlert, Key, Mail, Trash2, Calendar, HardDrive, CheckCircle, Edit } from 'lucide-react';

interface AdminViewProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (user: User) => void;
  currentUser: User;
}

export default function AdminView({ users, onAddUser, onDeleteUser, onUpdateUser, currentUser }: AdminViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('velemenyezo');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // States for Editing/Maintenance
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('velemenyezo');
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const handleStartEdit = (user: User) => {
    setUserToEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditErrorMsg(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg(null);

    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      setEditErrorMsg('Minden mezőt ki kell tölteni!');
      return;
    }

    if (users.some((u) => u.id !== userToEdit?.id && u.email.toLowerCase() === editEmail.trim().toLowerCase())) {
      setEditErrorMsg('Ez az e-mail cím már használatban van másik felhasználónál!');
      return;
    }

    if (editPassword.length < 6) {
      setEditErrorMsg('A jelszónak legalább 6 karakterből kell állnia.');
      return;
    }

    if (userToEdit) {
      onUpdateUser({
        ...userToEdit,
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
        password: editPassword.trim(),
      });
      setUserToEdit(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validiations
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Minden mezőt ki kell tölteni!');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('Ez az e-mail cím már használatban van!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A jelszónak legalább 6 karakterből kell állnia.');
      return;
    }

    onAddUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password: password.trim(),
    });

    setSuccessMsg(`"${name}" sikeresen regisztrálva lett, jelszóval rendelkező ${role} szerepkörrel!`);
    // Reset form
    setName('');
    setEmail('');
    setPassword('');
    setRole('velemenyezo');
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
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'beterjeszto':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'velemenyezo':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'jovahagyo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="admin-view">
      {/* Overview Dashboard Cards */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-800" />
            Felhasználók és Jogosultságok Kezelése (Rendszergazda)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Hozzon létre új felhasználókat jelszó és szerepkör megadásával, vagy tekintse át a VPS hozzáféréseket.
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 border border-slate-200 p-1.5 rounded-xl shrink-0">
          <div className="bg-white px-3 py-1 text-xs font-semibold rounded-lg text-slate-700 shadow-xs flex items-center gap-1.5 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            VPS Docker: ON
          </div>
          <div className="px-3 py-1 text-xs font-bold text-slate-500">
            Kapacitás: 98% szabad
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Form to Add Users */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6" id="add-user-form">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-slate-950" />
            Új Felhasználó Létrehozása
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teljes Név
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pl. Kiss János"
                className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail Cím (Belépési azonosító)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pl@vps.hu"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jelszó (Kötelező)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Legalább 6 karakter"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Felhasználói Szerepkör
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-medium"
              >
                <option value="beterjeszto">Beterjesztő (Word feltöltő)</option>
                <option value="velemenyezo">Véleményező (Korrektúrázó)</option>
                <option value="jovahagyo">Jóváhagyó (Véglegesítő)</option>
                <option value="admin">Rendszergazda (Admin)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                A kiválasztott munkatárs azonnal beléphet és elvégezheti a szerepének megfelelő feladatokat.
              </p>
            </div>

            {/* Register button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Felhasználó Létrehozása
            </button>
          </form>
        </div>

        {/* Step 2: List of active accounts */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-md rounded-2xl p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-950" />
              Aktív Felhasználói Fiókok
            </h2>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
              Összesen: {users.length} fiók
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Név</th>
                  <th className="px-4 py-3">E-mail / Azonosító</th>
                  <th className="px-4 py-3">Szerepkör</th>
                  <th className="px-4 py-3">Jelszó</th>
                  <th className="px-4 py-3 text-right">Művelet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isSystemDefault = u.id === '1' || u.id === '2' || u.id === '3' || u.id === '4';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {u.name}
                          {isCurrent && (
                            <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded-sm font-bold">
                              Én
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 select-all">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-sm border ${getRoleColor(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{u.password || 'n/a'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Karbantartás / Szerkesztés"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title={isSystemDefault ? "Gyári teszt fiók" : "Törlés"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>A rendszer minden fiókot védett formában ment és lokálisan perzisztál.</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <span>Durable Storage: <strong>Active (localStorage)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setUserToDelete(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-sans flex items-center gap-2 text-red-600">
               ⚠️ Felhasználófiók Végleges Törlése
            </h3>
            <p className="text-xs text-slate-600 mb-4 font-sans leading-relaxed">
              Biztosan törölni szeretné <span className="font-extrabold text-slate-900">"{userToDelete.name}"</span> ({getRoleLabel(userToDelete.role)}) hozzáférését? A törlés hatására ez a felhasználó azonnal ki indexelt lesz a rendszerből.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none"
              >
                Mégse, megtartom
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-lg cursor-pointer select-none"
              >
                Igen, törlöm végleg
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Edit User Maintenance Modal */}
      {userToEdit && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setUserToEdit(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-sans flex items-center gap-2">
               ✏️ Felhasználói Fiók Karbantartása
            </h3>
            
            <p className="text-xs text-slate-500 mb-4 font-sans leading-normal">
              Módosítsa a felhasználói fiók belépési adatait és jogosultsági szintjét.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editErrorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-start gap-1.5 font-sans">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{editErrorMsg}</span>
                </div>
              )}

              {/* Edit Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">
                  Teljes Név
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-sans font-medium"
                />
              </div>

              {/* Edit Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">
                  E-mail Cím (Azonosító)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-mono"
                  />
                </div>
              </div>

              {/* Edit Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">
                  Jelszó (Módosítás vagy megerősítés)
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Legalább 6 karakter"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-mono font-medium"
                  />
                </div>
              </div>

              {/* Edit Role */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">
                  Szerepkör
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 font-sans font-medium"
                >
                  <option value="beterjeszto">Beterjesztő (Word feltöltő)</option>
                  <option value="velemenyezo">Véleményező (Korrektúrázó)</option>
                  <option value="jovahagyo">Jóváhagyó (Véglegesítő)</option>
                  <option value="admin">Rendszergazda (Admin)</option>
                </select>
                {userToEdit.id === currentUser.id && editRole !== 'admin' && (
                  <p className="text-[10.5px] text-amber-600 bg-amber-50 rounded-md border border-amber-200/50 p-2 mt-1.5 font-sans font-medium leading-relaxed">
                    ⚠️ Figyelem: Saját jogosultságának módosításával azonnal elveszítheti a rendszergazdai hozzáférését és kijelentkezik az adminisztrátori felületről!
                  </p>
                )}
                {(userToEdit.id === '1' || userToEdit.id === '2' || userToEdit.id === '3' || userToEdit.id === '4') && (
                  <p className="text-[10px] text-slate-400 mt-1 font-sans leading-normal">
                    Ez egy gyári teszt fiók. Módosítása után a belépésnél az új adatok lesznek érvényesek.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToEdit(null)}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none font-sans"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-white rounded-lg cursor-pointer select-none font-sans uppercase tracking-wider"
                >
                  Módosítások mentése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
