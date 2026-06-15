/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Document as DocxGen, Packer, Paragraph as DocxParagraphTag, TextRun } from 'docx';
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
  
  // Custom non-blocking modal / notification states
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [finalizeWarning, setFinalizeWarning] = useState<string | null>(null);
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);

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

    const warningText = hasPending 
      ? 'Figyelem: A dokumentumban maradtak még el nem bírált javaslatok. Ha most véglegesíti, az el nem bírált javaslatok (korrektúrák) figyelmen kívül lesznek hagyva és automatikusan elutasításra kerülnek. Biztosan véglegesíti?'
      : 'Biztosan jóváhagyja és véglegesen lezárja a dokumentumot? Ezzel hivatalossá teszi a szövegezést, és a státusz "Approved" (Jóváhagyva) lesz.';

    setFinalizeWarning(warningText);
    setPendingDocId(docId);
    setShowFinalizeConfirm(true);
  };

  const confirmFinalize = () => {
    if (!pendingDocId) return;
    onFinalizeDocument(pendingDocId);
    
    // Reload updated
    const updated = documents.find(d => d.id === pendingDocId);
    setActiveDoc(updated || null);
    
    setShowFinalizeConfirm(false);
    setPendingDocId(null);
    setFinalizeWarning(null);
    setSuccessMessage('A dokumentum sikeresen zárolva, aláírva és véglegesítve lett!');
    setTimeout(() => setSuccessMessage(null), 5000);
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

  const handleDownloadDocx = (doc: Document) => {
    try {
      const docxFile = new DocxGen({
        sections: [
          {
            properties: {},
            children: doc.paragraphs.map(
              (p) =>
                new DocxParagraphTag({
                  children: [
                    new TextRun({
                      text: p.currentText,
                      size: 24, // 12pt (Word half-points: 24 = 12pt)
                    }),
                  ],
                })
            ),
          },
        ],
      });

      Packer.toBlob(docxFile).then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = doc.title.endsWith('.docx') ? doc.title.slice(0, -5) : doc.title;
        link.download = `${baseName}_final.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }).catch((err) => {
        console.error("Hiba a Word fájl generálásakor:", err);
      });
    } catch (err: any) {
      console.error("Error creating docx file:", err);
    }
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(getCleanDocumentText(activeDoc))}
                      className="px-3 py-1.5 border border-slate-200 text-slate-750 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Másolva!' : 'Tiszta Szöveg'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTxt(activeDoc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Letöltés (.TXT)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadDocx(activeDoc)}
                      className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Letöltés (.DOCX)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Deadline & Comment if available */}
              {(activeDoc.reviewDeadline || activeDoc.comment) && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 text-xs text-left">
                  {activeDoc.reviewDeadline && (
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
                      <span className="font-bold shrink-0">
                        ⏱️ Véleményezési határidő{activeDoc.isDeadlineExtended ? ' (meghosszabbított)' : ''}:
                      </span>
                      <span className="font-semibold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                        {new Date(activeDoc.reviewDeadline).toLocaleDateString('hu-HU')}
                      </span>
                      {activeDoc.extensionCount && activeDoc.extensionCount > 0 ? (
                        <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shrink-0 select-none">
                          Meghosszabbítva: {activeDoc.extensionCount} alkalommal
                        </span>
                      ) : null}
                    </div>
                  )}
                  {activeDoc.comment && (
                    <div className="text-slate-700 flex flex-col gap-1">
                      <span className="font-bold">💡 Beterjesztő megjegyzése / Instrukció:</span>
                      <p className="bg-white border border-slate-200 p-2.5 rounded-lg italic text-slate-600 font-sans">
                        {activeDoc.comment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Document Flow Panel */}
              <div className="space-y-6 text-left">
                {/* Continuous Document Text Live Preview */}
                <div className="space-y-3 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-750" />
                    Folyamatos Dokumentumszöveg (Élő előnézet)
                  </h3>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 max-h-[220px] overflow-y-auto pr-3 select-text">
                    <div className="text-slate-800 font-sans text-sm md:text-[14.5px] leading-relaxed space-y-4 whitespace-pre-wrap">
                      {activeDoc.paragraphs.map((p) => p.currentText || p.originalText).join('\n\n')}
                    </div>
                  </div>
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

      {/* Success Notification Toast Banner */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-55 animate-fade-in transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-slate-400 hover:text-white font-bold text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Finalize Confirmation Modal */}
      {showFinalizeConfirm && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowFinalizeConfirm(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-sans flex items-center gap-2">
              <Stamp className="w-5 h-5 text-slate-900 shrink-0" />
              Dokumentum Végleges Aláírása
            </h3>
            <p className="text-xs text-slate-600 mb-4 font-sans leading-relaxed">
              {finalizeWarning}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFinalizeConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-305 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none"
              >
                Mégse, folytatom
              </button>
              <button
                type="button"
                onClick={confirmFinalize}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-xs font-bold text-white rounded-lg cursor-pointer select-none"
              >
                Igen, aláírom és véglegesítem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
