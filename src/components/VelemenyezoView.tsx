/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Document, Paragraph, Suggestion, User } from '../types';
import { FileText, Eye, AlertCircle, Sparkles, Check, Edit3, Trash2, PlusCircle, MessageSquare, CornerDownRight, Send } from 'lucide-react';

interface VelemenyezoViewProps {
  documents: Document[];
  currentUser: User;
  onAddSuggestion: (docId: string, paragraphId: string, suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => void;
  onSetStatus: (docId: string, status: 'reviewed' | 'under_review') => void;
}

export default function VelemenyezoView({ documents, currentUser, onAddSuggestion, onSetStatus }: VelemenyezoViewProps) {
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);

  // Form states for new suggestion
  const [sugType, setSugType] = useState<'modify' | 'delete' | 'insert' | 'comment'>('modify');
  const [highlightedText, setHighlightedText] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [comment, setComment] = useState('');

  // We filter all documents that are currently in review queue (under_review)
  const inReviewDocs = documents.filter((doc) => doc.status === 'under_review');

  const handleSelectParagraph = (p: Paragraph) => {
    setActiveParagraphId(p.id);
    setHighlightedText(p.originalText); // Pre-fill with original paragraph text or part of it
    setSuggestedText('');
    setComment('');
  };

  const submitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !activeParagraphId) return;

    onAddSuggestion(activeDoc.id, activeParagraphId, {
      reviewer: currentUser.name,
      type: sugType,
      highlightedText: sugType !== 'insert' ? highlightedText.trim() : undefined,
      suggestedText: sugType !== 'comment' ? suggestedText.trim() : undefined,
      comment: comment.trim() || undefined,
      status: 'pending'
    });

    // Reset suggestion fields
    setHighlightedText('');
    setSuggestedText('');
    setComment('');
    setActiveParagraphId(null);

    // Refresh active document view to reflect new suggestions immediately
    const updated = documents.find(d => d.id === activeDoc.id);
    if (updated) {
      setActiveDoc(updated);
    }
  };

  const handleFinishReview = (docId: string) => {
    if (confirm('Biztosan befejezi a véleményezést? A dokumentum átkerül "Véleményezve" státuszba a Jóváhagyó elé.')) {
      onSetStatus(docId, 'reviewed');
      setActiveDoc(null);
      setActiveParagraphId(null);
      alert('A korrektúrákat sikeresen beküldtük a döntéshozó elé!');
    }
  };

  // Helper render to show inline track changes in reviewer's preview editor
  const renderInteractiveText = (p: Paragraph) => {
    if (p.suggestions.length === 0) {
      return <span className="text-slate-800">{p.originalText}</span>;
    }

    // Since many different things can change we list them clearly
    return (
      <div className="space-y-2 text-slate-800 font-sans">
        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
          <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Eredeti Szöveg:</span>
          {p.originalText}
        </div>
        
        {/* Track change cards */}
        <div className="space-y-1.5 pl-3 border-l-2 border-slate-300">
          {p.suggestions.map((sug) => (
            <div key={sug.id} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-slate-900 bg-slate-200 px-1.5 py-0.2 rounded-xs select-none">
                  {sug.reviewer}
                </span>
                <span className={`px-1.5 py-0.2 font-semibold rounded-sm text-[9px] uppercase ${
                  sug.type === 'modify' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  sug.type === 'delete' ? 'bg-red-50 text-red-750 border border-red-200' :
                  sug.type === 'insert' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-blue-50 text-blue-750 border border-blue-200'
                }`}>
                  {sug.type === 'modify' ? 'Cserélendő kód/szöveg' :
                   sug.type === 'delete' ? 'Törlendő' :
                   sug.type === 'insert' ? 'Beszúrandó' :
                   'Megjegyzés'}
                </span>
              </div>

              {sug.type === 'modify' && (
                <div className="mt-1 space-y-1">
                  <div className="line-through text-red-700 font-medium">Mit cserélünk: "{sug.highlightedText}"</div>
                  <div className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" /> Javasolt szöveg: "{sug.suggestedText}"
                  </div>
                </div>
              )}

              {sug.type === 'delete' && (
                <div className="line-through text-red-600 font-medium mt-1">Eltávolítandó: "{sug.highlightedText}"</div>
              )}

              {sug.type === 'insert' && (
                <div className="text-emerald-700 font-extrabold mt-1">Hozzáadandó: "{sug.suggestedText}"</div>
              )}

              {sug.comment && (
                <p className="text-[11px] text-slate-600 bg-amber-50/50 p-1.5 rounded-md border border-amber-100/60 italic mt-1 pb-1">
                  💡 Indoklás: {sug.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="velemenyezo-view">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Edit3 className="w-6 h-6 text-slate-800" />
          Korrektúra & Véleményező Munkaállomás
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Válassza ki a beterjesztett dokumentumot, véleményezze a bekezdéseket korrektúrák segítségével, majd küldje tovább jóváhagyásra.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Review Queue List */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-800" />
              Véleményezésre Váró Várólista ({inReviewDocs.length})
            </h2>

            {inReviewDocs.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                <Check className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs text-slate-600 font-bold">Minden tiszta!</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Nincs egyetlen beérkező véleményezendő dokumentum sem.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inReviewDocs.map((doc) => {
                  const isSelected = activeDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setActiveDoc(doc);
                        setActiveParagraphId(null);
                      }}
                      className={`p-4 border rounded-xl transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-slate-950 bg-slate-50 shadow-xs ring-1 ring-slate-900/10'
                          : 'border-slate-200 hover:border-slate-350 bg-white'
                      }`}
                    >
                      <h3 className="text-xs font-bold text-slate-950 truncate">{doc.title}</h3>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">
                        Beterjesztő: {doc.creatorName}
                      </p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-400">
                        <span>{new Date(doc.createdAt).toLocaleDateString('hu-HU')}</span>
                        <span className="bg-slate-100 font-bold text-slate-700 px-1.5 py-0.5 rounded-sm">
                          {doc.paragraphs.length} bekezdés
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidelines info card */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Szakmai Irányelv
            </h3>
            <p className="text-[11px] text-slate-300 leading-relaxed text-left">
              A korrektúrázás során a javaslatokat precízen rögzítse. A "Jóváhagyó" szerepkörű vezető fogja látni a javasolt módosításokat egyesével, és lehetősége lesz elfogadni vagy elutasítani azokat.
            </p>
          </div>
        </div>

        {/* Right 2 columns: Active Workspace Layout */}
        <div className="lg:col-span-2">
          {activeDoc ? (
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6" id="reviewer-document-board">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-slate-800 animate-pulse" />
                    Korrektúra: {activeDoc.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Kattintson egy bekezdésre a korrektúra módosító doboz megnyitásához.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFinishReview(activeDoc.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Korrektúra Beküldése
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
                {/* Visual editor column */}
                <div className="md:col-span-3 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Szerkesztő Nézet (Kattintson a javításhoz)
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {activeDoc.paragraphs.map((p, idx) => {
                      const isModifyingThis = activeParagraphId === p.id;
                      const hasSuggestions = p.suggestions.length > 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectParagraph(p)}
                          className={`p-4 border rounded-xl transition-all relative group cursor-pointer ${
                            isModifyingThis
                              ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950/20'
                              : hasSuggestions
                              ? 'border-amber-200 bg-amber-50/10 hover:border-amber-300'
                              : 'border-slate-200 hover:border-slate-350 bg-white'
                          }`}
                        >
                          <span className="absolute top-2.5 right-2.5 text-[9px] font-mono text-slate-400 font-bold uppercase select-none opacity-50 group-hover:opacity-100">
                            Bekezdés #{idx + 1}
                          </span>
                          
                          <div className="text-sm leading-relaxed pr-10">
                            {renderInteractiveText(p)}
                          </div>

                          {!hasSuggestions && !isModifyingThis && (
                            <span className="text-[10px] text-slate-400 font-medium inline-block mt-2 underline opacity-0 group-hover:opacity-100 transition-opacity">
                              Korrektúra hozzáadása...
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Annotation Tool Window column */}
                <div className="md:col-span-2">
                  {activeParagraphId ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sticky top-20 shadow-xs animate-fade-in" id="annotation-box">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1">
                          <PlusCircle className="w-4 h-4 text-slate-800" />
                          Korrektúraszék
                        </h4>
                        <button
                          onClick={() => setActiveParagraphId(null)}
                          className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-600 font-bold transition-all cursor-pointer"
                        >
                          Mégse
                        </button>
                      </div>

                      <form onSubmit={submitSuggestion} className="space-y-3.5">
                        {/* Action Type */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Művelet Típusa
                          </label>
                          <div className="grid grid-cols-2 gap-1.5" id="sug-type-toggle">
                            <button
                              type="button"
                              onClick={() => { setSugType('modify'); setSuggestedText(''); }}
                              className={`py-1.5 px-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                                sugType === 'modify' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              Módosítás
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSugType('delete'); setSuggestedText(''); }}
                              className={`py-1.5 px-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                                sugType === 'delete' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              Törlés
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSugType('insert'); setSuggestedText(''); }}
                              className={`py-1.5 px-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                                sugType === 'insert' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              Beszúrás
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSugType('comment'); setSuggestedText(''); }}
                              className={`py-1.5 px-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                                sugType === 'comment' ? 'bg-slate-950 text-white border-slate-950' : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              Megjegyzés
                            </button>
                          </div>
                        </div>

                        {/* Text being targeted */}
                        {sugType !== 'insert' && sugType !== 'comment' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Kijelölt vagy cserélendő szöveg
                            </label>
                            <input
                              type="text"
                              required
                              value={highlightedText}
                              onChange={(e) => setHighlightedText(e.target.value)}
                              className="block w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-md text-xs focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                            />
                          </div>
                        )}

                        {/* New text proposal */}
                        {sugType !== 'delete' && sugType !== 'comment' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Javasolt új szöveg
                            </label>
                            <textarea
                              required
                              rows={2}
                              value={suggestedText}
                              onChange={(e) => setSuggestedText(e.target.value)}
                              placeholder={
                                sugType === 'insert'
                                  ? 'Írja be az itt beszúrandó új szöveget...'
                                  : 'Írja be a csereszöveget...'
                              }
                              className="block w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-md text-xs focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                            />
                          </div>
                        )}

                        {/* Justification Comment */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                            Indoklás / Bizottsági Széljegyző
                          </label>
                          <textarea
                            rows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Miért szükséges ez a módosítás? (opcionális)"
                            className="block w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-md text-xs focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Korrektúra Rögzítése
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold">Nincs kiválasztott bekezdés</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Kattintson az egyik bekezdésre a bal oldalon inline módosítás kezdeményezéséhez.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 outline-2 outline-dashed outline-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 animate-pulse" />
              <h2 className="text-base font-bold text-slate-700">Véleményező Panel</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Kérjük, válasszon egyet a baloldali várólistából, hogy betöltse a dokumentumot az interaktív "Korrektúra" nézetbe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
