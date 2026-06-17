/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
// @ts-ignore
import mammoth from 'mammoth';
import { Document as DocxGen, Packer, Paragraph as DocxParagraphTag, TextRun } from 'docx';
import { generateBeautifulDocx } from '../utils/docxFormatter';
import { Document, Paragraph, Suggestion, User } from '../types';
import { FileText, Eye, AlertCircle, Sparkles, Check, Edit3, Trash2, PlusCircle, MessageSquare, CornerDownRight, Send, UploadCloud, Download, CheckCircle2, Bell } from 'lucide-react';

interface VelemenyezoViewProps {
  documents: Document[];
  currentUser: User;
  onAddSuggestion: (docId: string, paragraphId: string, suggestion: Omit<Suggestion, 'id' | 'timestamp'>) => void;
  onSetStatus: (docId: string, status: 'reviewed' | 'under_review') => void;
  onUpdateParagraphs: (docId: string, paragraphs: Paragraph[], originalDocxBase64?: string) => void;
}

export default function VelemenyezoView({ documents, currentUser, onAddSuggestion, onSetStatus, onUpdateParagraphs }: VelemenyezoViewProps) {
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);

  // Custom dialog and notification states
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Drag & drop state for real docx file parsing
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadedFile = (file: File) => {
    if (!activeDoc) {
      setErrorMessage("Kérjük, előbb válasszon ki egy dokumentumot a várólistából, amit frissíteni szeretne a valós Word-fájllal!");
      return;
    }

    const isDocx = file.name.toLowerCase().endsWith('.docx') || 
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const processFile = (originalDocxBase64?: string) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let extractedText = '';
        if (isDocx) {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          try {
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            extractedText = result.value;
          } catch (err: any) {
            console.error("Hiba a .docx beolvasása közben:", err);
            setErrorMessage(`Hiba a .docx beolvasásakor: ${err.message || err}`);
            return;
          }
        } else {
          extractedText = event.target?.result as string;
        }

        if (extractedText && extractedText.trim()) {
          const parsedParagraphs = extractedText
            .split('\n')
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
            .map((txt, index) => ({
              id: `p-${Date.now()}-${index}`,
              originalText: txt,
              currentText: txt,
              suggestions: []
            }));

          // Dynamically update document paragraphs globally and locally
          onUpdateParagraphs(activeDoc.id, parsedParagraphs, originalDocxBase64);
          
          setActiveDoc({
            ...activeDoc,
            paragraphs: parsedParagraphs,
            originalDocxBase64: originalDocxBase64 || activeDoc.originalDocxBase64
          });
          setSuccessMessage(`A(z) "${file.name}" fájlból ${parsedParagraphs.length} bekezdést sikeresen beolvastunk és frissítettük a szöveg tartalmát!`);
          setTimeout(() => setSuccessMessage(null), 5000);
        } else {
          setErrorMessage("Üres fájl vagy nem sikerült szöveget kinyerni.");
        }
      };

      if (isDocx) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    };

    if (isDocx) {
      const readerBase64 = new FileReader();
      readerBase64.onload = (e) => {
        const dataUrlStr = e.target?.result as string;
        if (dataUrlStr) {
          const b64 = dataUrlStr.split(',')[1];
          processFile(b64);
        } else {
          processFile(undefined);
        }
      };
      readerBase64.readAsDataURL(file);
    } else {
      processFile(undefined);
    }
  };

  const handleDownloadFile = (doc: Document) => {
    if (doc.originalDocxBase64) {
      try {
        const byteCharacters = atob(doc.originalDocxBase64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = doc.originalFilename || (doc.title.endsWith('.docx') ? doc.title : `${doc.title}.docx`);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err: any) {
        console.error("Hiba a tárolt Word fájl binárissá alakítása közben, generáló módra váltás...", err);
      }
    }

    try {
      const docxFile = generateBeautifulDocx(doc.title, doc.paragraphs.map(p => p.originalText));

      Packer.toBlob(docxFile).then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = doc.originalFilename || (doc.title.endsWith('.docx') ? doc.title : `${doc.title}.docx`);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }).catch((err) => {
        console.error("Hiba a Word fájl generálása közben:", err);
        setErrorMessage(`Nem sikerült generálni a Word fájlt: ${err?.message || err}`);
      });
    } catch (err: any) {
      console.error("Error creating docx object:", err);
      setErrorMessage(`Hiba történt: ${err.message || err}`);
    }
  };

  // We filter all documents that are currently in review queue (under_review)
  const inReviewDocs = documents.filter((doc) => doc.status === 'under_review');
  const approvedDocs = documents.filter((doc) => doc.status === 'approved');

  const handleDownloadTxt = (doc: Document) => {
    const text = doc.paragraphs.map(p => p.currentText).join('\n\n');
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
    if (doc.correctedDocxBase64) {
      try {
        const byteCharacters = atob(doc.correctedDocxBase64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = doc.title.endsWith('.docx') ? doc.title.slice(0, -5) : doc.title;
        const downloadName = doc.correctedFilename || `${baseName}_final.docx`;
        link.download = downloadName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      } catch (err: any) {
        console.error("Hiba a tárolt véglegesített Word fájl letöltése közben, dinamikus generálásra váltás...", err);
      }
    }

    try {
      const docxFile = generateBeautifulDocx(doc.title, doc.paragraphs.map(p => p.currentText));

      Packer.toBlob(docxFile).then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = doc.title.endsWith('.docx') ? doc.title.slice(0, -5) : doc.title;
        const downloadName = doc.correctedFilename || `${baseName}_final.docx`;
        link.download = downloadName;
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

  const handleFinishReview = (docId: string) => {
    setShowFinishConfirm(true);
  };

  const confirmFinishReview = () => {
    if (!activeDoc) return;
    onSetStatus(activeDoc.id, 'reviewed');
    setActiveDoc(null);
    setShowFinishConfirm(false);
    setSuccessMessage('A dokumentumot sikeresen továbbítottuk a döntéshozó elé!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
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
              Véleményezésre váró dokumentumok ({inReviewDocs.length})
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
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
                        <div className="flex flex-wrap items-center gap-1.5 font-medium">
                          <span>Beterjesztve: {new Date(doc.createdAt).toLocaleDateString('hu-HU')}</span>
                          {doc.reviewDeadline && (
                            <>
                              <span className="text-red-700 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                ⏱️ Határidő{doc.isDeadlineExtended ? ' (meghosszabbított)' : ''}: {new Date(doc.reviewDeadline).toLocaleDateString('hu-HU')}
                              </span>
                              {doc.extensionCount && doc.extensionCount > 0 ? (
                                <span className="text-amber-700 font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                  Meghosszabbítva: {doc.extensionCount} alkalommal
                                </span>
                              ) : null}
                            </>
                          )}
                        </div>
                        <span className="bg-slate-100 font-bold text-slate-700 px-1.5 py-0.5 rounded-sm shrink-0">
                          {doc.paragraphs.length} bekezdés
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Értesítések: Jóváhagyott / Lezárt folyamatok */}
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 select-none">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
              Értesítések: Lezárt Folyamatok ({approvedDocs.length})
            </h2>

            {approvedDocs.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400">
                Nincs még lezárt vagy jóváhagyott dokumentum.
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {approvedDocs.map((doc) => {
                  const isSelected = activeDoc?.id === doc.id;
                  
                  // Check if this reviewer left any suggestions in this document
                  const hasMySuggestion = doc.paragraphs.some((p) =>
                    p.suggestions.some((s) => s.reviewer === currentUser.name)
                  );

                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDoc(doc)}
                      className={`p-3 border rounded-xl transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/15 shadow-xs ring-1 ring-emerald-650/20'
                          : 'border-slate-200 hover:border-emerald-250 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <h3 className="text-xs font-bold text-slate-950 truncate flex-1">{doc.title}</h3>
                        <span className="shrink-0 bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-sm text-[8px] uppercase border border-emerald-200 select-none">
                          Kész & Jóváhagyva
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">Beterjesztő: {doc.creatorName}</p>

                      {hasMySuggestion ? (
                        <div className="mt-1.5 bg-blue-50 border border-blue-100 rounded-md p-1.5 text-[9px] text-blue-800 font-bold flex items-center gap-1 select-none">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Ön is közreműködött ezen a dokumentumon!</span>
                        </div>
                      ) : (
                        <p className="text-[9px] text-slate-400 mt-1">Összesített vállalati archívum</p>
                      )}
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
            {activeDoc && !activeDoc.originalDocxBase64 && (
              <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-300">
                ⚠️ Ennek a dokumentumnak nincs meg az eredeti Word formázása (korábban vagy sablonból lett létrehozva). Kérjük, hogy a teljes minőség érdekében töltse fel újra a Beterjesztő felületen!
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns: Active Workspace Layout */}
        <div className="lg:col-span-2">
          {activeDoc ? (
            <div className="space-y-4">
              {/* Header above the card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold select-none">
                    {activeDoc.status === 'approved' ? '🏆' : '✏️'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {activeDoc.status === 'approved' ? 'Végső Véglegesített Szöveg - ' : 'Szöveg Tartalma - '}
                    {activeDoc.title.endsWith('.docx') ? activeDoc.title : `${activeDoc.title}.docx`}
                  </h2>
                </div>
                {activeDoc.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleFinishReview(activeDoc.id)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 select-none text-white font-bold rounded-xl flex items-center gap-2.5 cursor-pointer transition-all shadow-sm active:scale-98 animate-pulse"
                  >
                    <Send className="w-4 h-4 shrink-0 text-white" />
                    <div className="text-left font-sans font-bold leading-tight text-[10px] tracking-wider uppercase text-white">
                      <div>KORREKTÚRA</div>
                      <div>BEKÜLDÉSE</div>
                    </div>
                  </button>
                )}
              </div>

              {/* Card item */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`bg-white border text-left shadow-lg rounded-2xl p-6 transition-all ${
                  dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                }`}
                id="reviewer-document-board"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950 leading-tight">
                      {activeDoc.title.replace('.docx', '')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Beküldő: {activeDoc.creatorName || 'Kovács Péter'} • {activeDoc.status === 'approved' ? 'Sikeresen visszajelzett és Jóváhagyott' : 'Véleményezésre vár'}
                    </p>
                  </div>
                  <div>
                    {activeDoc.status === 'approved' ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap select-none flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Jóváhagyott & Véglegesített
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 border border-amber-200/50 rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap select-none">
                        Aktív dokumentum
                      </span>
                    )}
                  </div>
                </div>

                {/* Deadline & Comment for the Reviewer */}
                {(activeDoc.reviewDeadline || activeDoc.comment) && (
                  <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                    {activeDoc.reviewDeadline && (
                      <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
                        <span className="font-bold">
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
                      <div className="text-slate-700">
                        <span className="font-bold block mb-1">💡 Beterjesztő megjegyzése:</span>
                        <p className="bg-white border border-slate-150 p-2.5 rounded-lg italic text-slate-600">
                          {activeDoc.comment}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 my-4" />

                {/* Clean, spacious single column document preview canvas */}
                <div className="max-w-4xl mx-auto space-y-4 select-text">
                  <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 flex items-center justify-between gap-4 mb-4 select-none">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                      📖 Olvasó mód • Beépített Mammoth Text Extractor
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 text-left max-h-[275px] overflow-y-auto pr-2">
                    <div className="text-slate-800 font-sans text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-wrap">
                      {activeDoc.paragraphs.map((p) => p.currentText || p.originalText).join('\n\n')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom action buttons */}
              <div className="flex justify-center items-center gap-6 mt-4">
                {/* File Upload Selector Hidden */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {activeDoc.status === 'approved' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(activeDoc)}
                      className="px-6 py-2.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center min-w-[180px]"
                    >
                      <Download className="w-4 h-4 mr-2 text-slate-600" />
                      Letöltés tiszta .TXT
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadDocx(activeDoc)}
                      className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center min-w-[180px]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Véglegesített .DOCX Letöltése
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(activeDoc)}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-sm tracking-wide rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center min-w-[160px]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Eredeti Fájl Letöltése
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm tracking-wide rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center min-w-[160px]"
                    >
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Korrektúrázott fájl feltöltése
                    </button>
                  </>
                )}
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

      {/* Success Notification Banner */}
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

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-red-955 border border-red-900 text-red-200 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-55 animate-fade-in transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)}
            className="ml-2 text-slate-400 hover:text-white font-bold text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Finish Review Confirmation Modal */}
      {showFinishConfirm && activeDoc && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setShowFinishConfirm(false)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-sans flex items-center gap-2">
              📝 Korrektúra Befejezése és Küldése
            </h3>
            <p className="text-xs text-slate-600 mb-4 font-sans leading-relaxed">
              Biztosan befejezi a véleményezést a(z) <span className="font-extrabold text-slate-900">"{activeDoc.title}"</span> dokumentumon? A bejegyzett javítási javaslatok így átkerülnek a döntéshozó Jóváhagyó elé elbírálásra.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none"
              >
                Mégse, folytatom
              </button>
              <button
                type="button"
                onClick={confirmFinishReview}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg cursor-pointer select-none"
              >
                Igen, befejezem és küldöm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
