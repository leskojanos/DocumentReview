/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Document, Paragraph, Suggestion, User } from '../types';
import { FileText, Eye, CheckCircle2, XCircle, ChevronRight, Stamp, Clipboard, Check, Download, History, PlayCircle } from 'lucide-react';

interface JovahagyoViewProps {
  documents: Document[];
  currentUser: User;
  onAcceptSuggestion: (docId: string, paragraphId: string, suggestionId: string) => void;
  onRejectSuggestion: (docId: string, paragraphId: string, suggestionId: string) => void;
  onFinalizeDocument: (docId: string) => void;
}

export default function JovahagyoView({ documents, currentUser, onAcceptSuggestion, onRejectSuggestion, onFinalizeDocument }: JovahagyoViewProps) {
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter documents in `'reviewed'` state (waiting for approval decision) and `'approved'` (already finalized, so we can view them)
  const reviewedDocs = documents.filter((doc) => doc.status === 'reviewed');
  const finalizedDocs = documents.filter((doc) => doc.status === 'approved');

  const handleSelectDoc = (doc: Document) => {
    setActiveDoc(doc);
  };

  const handleAccept = (paragraphId: string, suggestionId: string) => {
    if (!activeDoc) return;
    onAcceptSuggestion(activeDoc.id, paragraphId, suggestionId);
    
    // Refresh local document draft inside activeDoc state to show immediate update
    const updated = documents.find(d => d.id === activeDoc.id);
    if (updated) {
      setActiveDoc(updated);
    }
  };

  const handleReject = (paragraphId: string, suggestionId: string) => {
    if (!activeDoc) return;
    onRejectSuggestion(activeDoc.id, paragraphId, suggestionId);
    
    // Refresh local document
    const updated = documents.find(d => d.id === activeDoc.id);
    if (updated) {
      setActiveDoc(updated);
    }
  };

  const handleFinalize = (docId: string) => {
    // Check if there are any pending suggestions
    const currentDoc = documents.find(d => d.id === docId);
    if (!currentDoc) return;

    const hasPending = currentDoc.paragraphs.some(p => 
      p.suggestions.some(s => s.status === 'pending')
    );

    const msg = hasPending 
      ? 'Figyelem: A dokumentumban maradtak még el nem bírált javaslatok. Ha most véglegesíti, az el nem bírált javaslatok figyelmen kívül lesznek hagyva. Biztosan véglegesíti a fájlt?'
      : 'Biztosan jóváhagyja és lezárja a dokumentumot? Ezzel hivatalossá teszi a szövegezést, a státusz "Jóváhagyva" lesz.';

    if (confirm(msg)) {
      onFinalizeDocument(docId);
      // Reload updated
      const updated = documents.find(d => d.id === docId);
      setActiveDoc(updated || null);
      alert('A dokumentum sikeresen zárolva, aláírva és véglegesítve lett!');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate complete clean text output for copy/download
  const getCleanDocumentText = (doc: Document) => {
    return doc.paragraphs.map(p => p.currentText).join('\n\n');
  };

  const handleDownloadTxt = (doc: Document) => {
    const text = getCleanDocumentText(doc);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title}_final_hu.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="jovahagyo-view">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Stamp className="w-6 h-6 text-slate-800" />
          Vezetői Jóváhagyó & Aláíró Központ
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Bírálja el a véleményezők által javasolt változtatásokat és korrektúrákat, majd léptesse érvénybe a dokumentumot.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Queues Lists */}
        <div className="space-y-4">
          {/* Reviewed Queue */}
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-slate-800" />
              Döntésre váró Corrected fájlok ({reviewedDocs.length})
            </h2>

            {reviewedDocs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Nincs döntésre váró dokumentum.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reviewedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                      activeDoc?.id === doc.id
                        ? 'border-slate-950 bg-slate-50 ring-1 ring-slate-950/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <h3 className="text-xs font-bold text-slate-950 truncate">{doc.title}</h3>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold">
                      <span>Beküldte: {doc.creatorName}</span>
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded-xs border border-blue-100">
                        Véleményezve
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finalized/Approved Archive */}
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Véglegesített, Jóváhagyott Archívum ({finalizedDocs.length})
            </h2>

            {finalizedDocs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400">Még nincs véglegesített dokumentum.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {finalizedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3 border rounded-xl text-left cursor-pointer transition-all ${
                      activeDoc?.id === doc.id
                        ? 'border-emerald-600 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-slate-350 bg-white'
                    }`}
                  >
                    <h3 className="text-xs font-bold text-slate-950 truncate">{doc.title}</h3>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>{new Date(doc.createdAt).toLocaleDateString('hu-HU')}</span>
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-1.5 py-0.2 rounded-xs">
                        Lezárva & Aláírva
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns: Decision Board workspace */}
        <div className="lg:col-span-2">
          {activeDoc ? (
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6" id="approver-workspace">
              {/* Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-md uppercase font-mono">
                      {activeDoc.status === 'approved' ? 'Archívum' : 'Aktív Bírálat'}
                    </h2>
                    <span className="text-xs text-slate-500">
                      ID: {activeDoc.id}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-950 mt-1">{activeDoc.title}</h2>
                  <p className="text-xs text-slate-500">
                    Beterjesztő: {activeDoc.creatorName} • {new Date(activeDoc.createdAt).toLocaleString('hu-HU')}
                  </p>
                </div>

                {activeDoc.status === 'reviewed' ? (
                  <button
                    onClick={() => handleFinalize(activeDoc.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    id="finalize-doc-btn"
                  >
                    <Stamp className="w-4 h-4" />
                    Jóváhagy és Véglegesít
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(getCleanDocumentText(activeDoc))}
                      className="px-3 py-1.5 border border-slate-200 text-slate-750 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Másolva!' : 'Tiszta Szöveg'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTxt(activeDoc)}
                      className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Letöltés (.TXT)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Document Flow Panel */}
              <div className="space-y-6 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dokumentum Szövegfolyam & Korrektúrák Bírálata
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {activeDoc.paragraphs.map((p, pIdx) => {
                    const sortedSuggestions = p.suggestions;
                    const hasPendingSug = sortedSuggestions.some(s => s.status === 'pending');

                    return (
                      <div key={p.id} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-400 font-bold font-mono">
                          <span>Bekezdés #{pIdx + 1}</span>
                          {hasPendingSug && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full font-bold">
                              Döntést Igényel!
                            </span>
                          )}
                        </div>

                        {/* Current text is display */}
                        <div className="text-sm text-slate-800 leading-relaxed font-sans">
                          {p.currentText}
                        </div>

                        {/* If suggestions list exist */}
                        {sortedSuggestions.length > 0 && (
                          <div className="border-t border-slate-200/60 pt-3 space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Korrektúra Javaslatok:
                            </h4>

                            {sortedSuggestions.map((sug) => {
                              return (
                                <div
                                  key={sug.id}
                                  className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    sug.status === 'approved'
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                      : sug.status === 'rejected'
                                      ? 'bg-slate-100 border-slate-200 text-slate-500 line-through'
                                      : 'bg-white border-slate-200 shadow-xs'
                                  }`}
                                >
                                  {/* Suggestion Info */}
                                  <div className="space-y-1 md:max-w-[70%]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{sug.reviewer}</span>
                                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-sm border uppercase ${
                                        sug.type === 'modify' ? 'bg-amber-50 border-amber-250 text-amber-700' :
                                        sug.type === 'delete' ? 'bg-red-50 border-red-250 text-red-700' :
                                        sug.type === 'insert' ? 'bg-emerald-50 border-emerald-250 text-emerald-750' :
                                        'bg-blue-50 border-blue-200 text-blue-700'
                                      }`}>
                                        {sug.type === 'modify' ? 'Csere' :
                                         sug.type === 'delete' ? 'Törlés' :
                                         sug.type === 'insert' ? 'Beszúrás' :
                                         'Megjegyzés'}
                                      </span>
                                    </div>

                                    {sug.type === 'modify' && (
                                      <div className="text-[11px] font-medium leading-relaxed">
                                        Eredeti részlet: <span className="line-through text-red-600">"{sug.highlightedText}"</span> <br />
                                        Javasolt új rész: <span className="font-extrabold text-slate-950 bg-amber-50 px-1">"{sug.suggestedText}"</span>
                                      </div>
                                    )}

                                    {sug.type === 'delete' && (
                                      <div className="text-[11px] font-medium leading-relaxed">
                                        Törlendő szakasz: <strong className="line-through text-red-650">"{sug.highlightedText}"</strong>
                                      </div>
                                    )}

                                    {sug.type === 'insert' && (
                                      <div className="text-[11px] font-medium leading-relaxed">
                                        Beillesztendő szöveg: <strong className="bg-emerald-50 text-slate-900 px-1">"{sug.suggestedText}"</strong>
                                      </div>
                                    )}

                                    {sug.comment && (
                                      <p className="text-[10.5px] italic text-slate-600 bg-slate-50 p-1 rounded border border-slate-200/50 mt-1">
                                        💡 Érv: {sug.comment}
                                      </p>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex gap-1.5 md:self-center shrink-0">
                                    {sug.status === 'pending' ? (
                                      <>
                                        <button
                                          onClick={() => handleAccept(p.id, sug.id)}
                                          className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          Elfogad
                                        </button>
                                        <button
                                          onClick={() => handleReject(p.id, sug.id)}
                                          className="px-2.5 py-1.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          Elvet
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-[11px] font-extrabold text-slate-500 uppercase py-1 px-2.5 bg-slate-100 rounded-lg">
                                        {sug.status === 'approved' ? '✓ ELFOGADVA' : '✗ ELVETVE'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Audit trail at the bottom */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-600" />
                    Hivatalos Változásnapló (Audit Trail)
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {activeDoc.history.map((h) => (
                      <div key={h.id} className="text-[10px] text-slate-600 flex justify-between p-1 bg-white border border-slate-100 rounded">
                        <span>
                          <strong className="text-slate-800">{h.userName}</strong> ({h.userRole}): {h.action}
                        </span>
                        <span className="font-mono text-slate-400">
                          {new Date(h.timestamp).toLocaleString('hu-HU')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 outline-2 outline-dashed outline-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <Stamp className="w-16 h-16 mx-auto mb-4 text-slate-300 animate-pulse" />
              <h2 className="text-base font-bold text-slate-705">Jóváhagyó Munkaállomás</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Kattintson egy fájlra a bal oldali sávból a döntési munkasík megnyitásához.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
