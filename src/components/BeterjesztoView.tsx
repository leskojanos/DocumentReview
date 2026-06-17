/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Document as DocxGen, Packer, Paragraph as DocxParagraphTag, TextRun } from 'docx';
import { generateBeautifulDocx } from '../utils/docxFormatter';
// @ts-ignore
import mammoth from 'mammoth';
import { Document, Paragraph, User } from '../types';
import { UploadCloud, FileText, CheckCircle2, Clock, Eye, Send, PlayCircle, Clipboard, History, ArrowRight, Trash2, Download } from 'lucide-react';

interface BeterjesztoViewProps {
  documents: Document[];
  currentUser: User;
  onAddDocument: (
    title: string,
    paragraphs: Paragraph[],
    originalDocxBase64?: string,
    reviewDeadline?: string,
    comment?: string,
    originalFilename?: string,
    correctedFilename?: string
  ) => void;
  onDeleteDocument: (docId: string) => void;
  onExtendDeadline?: (docId: string, newDeadline: string) => void;
}

const TEMPLATES = [
  {
    title: 'ISO 9001 Minőségbiztosítási Kézikönyv v1.0',
    paragraphs: [
      'A jelen kézikönyv leírja a szervezetünk és munkatársaink által követett kötelező minőségirányítási alapelveket az ISO 9001 szabványnak megfelelően.',
      'Minden egyes eladott és átadott szoftvermodul tesztelését a minőségellenőr kollégának manuálisan kell elvégeznie legalább 3 alkalommal a kiadás előtt.',
      'Az ügyfélszolgálati panaszokat 24 órán belül rögzíteni és kivizsgálni szükséges, majd a válaszadási határidőt 3 munkanapon belül garantáljuk.',
      'A rendszeres belső auditokat évente legalább egy alkalommal szükséges lefolytatni, melynek jegyzőkönyvét az ügyvezető igazgatónak be kell terjeszteni.'
    ]
  },
  {
    title: 'Szervezeti és Működési Szabályzat (SZMSZ) v2',
    paragraphs: [
      'Jelen Szervezeti és Működési Szabályzat határozza meg a Társaság belső felépítését, az osztályok közötti feladatmegosztást és a döntési hatásköröket.',
      'A fejlesztési igazgató jogosult önállóan dönteni a havi 500,000 Ft alatti informatikai eszközbeszerzésekről a költségvetés keretén belül.',
      'Minden munkatárs köteles a heti munkaidő jelentését legkésőbb a tárgyhetet követő hétfő reggel 10:00-ig hiánytalanul leadni a HR részére.',
      'Az otthoni munkavégzés (Home Office) mértéke heti 2 napban van maximálva, kivéve ha az osztályvezető külön írásbeli engedélyt ad.'
    ]
  }
];

const getNextWeekDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

const getMinExtendDate = (currentDeadlineStr?: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (!currentDeadlineStr) return tomorrowStr;

  const currentD = new Date(currentDeadlineStr);
  currentD.setDate(currentD.getDate() + 1);
  const nextDayOfCurrentStr = currentD.toISOString().split('T')[0];

  return tomorrowStr > nextDayOfCurrentStr ? tomorrowStr : nextDayOfCurrentStr;
};

export default function BeterjesztoView({ documents, currentUser, onAddDocument, onDeleteDocument, onExtendDeadline }: BeterjesztoViewProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [originalDocxBase64, setOriginalDocxBase64] = useState<string | undefined>(undefined);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [docIdToDelete, setDocIdToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata states
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [comment, setComment] = useState('');

  // Drop/Import Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [tempDeadline, setTempDeadline] = useState('');
  const [tempComment, setTempComment] = useState('');

  // Extend deadline states
  const [showExtendForm, setShowExtendForm] = useState(false);
  const [extendDeadlineVal, setExtendDeadlineVal] = useState('');

  const myDocuments = documents.filter((doc) => doc.creatorId === currentUser.id);

  const handleDeleteClick = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setDocIdToDelete(docId);
  };

  const handleTemplateSelect = (idx: number) => {
    setSelectedTemplateIdx(idx);
    setTitle(TEMPLATES[idx].title);
    setContent(TEMPLATES[idx].paragraphs.join('\n\n'));
    setOriginalDocxBase64(undefined);
    setReviewDeadline('');
    setComment('');
  };

  const parseParagraphs = (text: string): Paragraph[] => {
    return text
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((txt, index) => ({
        id: `p-${Date.now()}-${index}`,
        originalText: txt,
        currentText: txt,
        suggestions: []
      }));
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const parsed = parseParagraphs(content);
    onAddDocument(
      title.trim(),
      parsed,
      originalDocxBase64,
      reviewDeadline || undefined,
      comment || undefined,
      uploadedFileName,
      uploadedFileName ? `${uploadedFileName.replace(/\.[^/.]+$/, "")}_corr.docx` : undefined
    );

    // Reset Form
    setTitle('');
    setContent('');
    setOriginalDocxBase64(undefined);
    setUploadedFileName(undefined);
    setSelectedTemplateIdx(null);
    setReviewDeadline('');
    setComment('');
    setSuccessMessage('A dokumentum sikeresen rögzítve lett beterjesztett státusszal!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  // Drag and Drop simulation/handling
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

  // Triggers Detail Prompter Modal on drag / upload
  const handleUploadedFile = (file: File) => {
    setPendingFile(file);
    setTempDeadline(getNextWeekDate());
    setTempComment('');
    setShowImportModal(true);
  };

  // Actual processor called once user confirms metadata in the modal
  const executeFileParsing = (file: File, deadlineVal: string, commentVal: string) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    const docTitle = file.name.replace(/\.[^/.]+$/, ""); // strip extension
    const isDocx = file.name.toLowerCase().endsWith('.docx') || 
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isDocx) {
      const readerBase64 = new FileReader();
      readerBase64.onload = (e) => {
        const dataUrlStr = e.target?.result as string;
        if (dataUrlStr) {
          const b64 = dataUrlStr.split(',')[1];
          setOriginalDocxBase64(b64);
        }
      };
      readerBase64.readAsDataURL(file);
    } else {
      setOriginalDocxBase64(undefined);
    }

    reader.onload = async (event) => {
      if (isDocx) {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          const extractedText = result.value;
          setTitle(docTitle);
          if (extractedText && extractedText.trim()) {
            setContent(extractedText);
          } else {
            setContent('Üres .docx tartalom, vagy nem sikerült szöveget kinyerni.');
          }
        } catch (err: any) {
          console.error("Hiba történt a .docx fájl beolvasása közben:", err);
          setTitle(docTitle);
          setContent(`[Hiba történt a .docx fájl beolvasásakor: ${err?.message || err}]`);
        }
      } else {
        const text = event.target?.result as string;
        setTitle(docTitle);
        setContent(text || 'Üres fájl tartalom.');
      }
    };

    if (isDocx) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }

    setReviewDeadline(deadlineVal);
    setComment(commentVal);
  };

  const handleImportModalConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingFile) return;
    executeFileParsing(pendingFile, tempDeadline, tempComment);
    setPendingFile(null);
    setShowImportModal(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return { text: 'Tervezet', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'under_review':
        return { text: 'Véleményezésre vár', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'reviewed':
        return { text: 'Véleményezve (Döntésre vár)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'approved':
        return { text: 'Jóváhagyva & Véglegesítve', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      default:
        return { text: status, color: 'bg-slate-50' };
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="beterjeszto-view">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-slate-800" />
            Dokumentum Beterjesztő Központ
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Töltsön fel MS Word (.docx) vagy szövegfájlokat, amelyeket a véleményezők korrektúrával javíthatnak.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Upload Board or Template Creator */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6" id="creation-section">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-slate-800" />
            Új Dokumentum Beterjesztése
          </h2>

          <form onSubmit={handleCreateDocument} className="space-y-4">
            {/* Drag & Drop Area */}
            <div>
              <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider mb-1">
                Kattintson vagy Húzzon be egy MS Word (.docx) javaslatot:
              </span>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Microsoft Word (.docx) vagy szövegfájl feltöltése
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Kattintson ide a tallózáshoz, vagy húzza be a fájlt ide
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Dokumentum Címe / Megnevezése
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pl: Adatvédelmi Irányelvek 2026"
                className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-sm focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
              />
            </div>

            {/* Content preview/edit */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                Szöveg Tartalma (Bekezdésenként törve)
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Írja be a szöveget vagy húzza fel a Word fájlt az automatikus beolvasáshoz."
                className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 leading-relaxed"
              ></textarea>
              <p className="text-[10px] text-slate-500 mt-1">
                Tipp: Minden új bekezdés külön egységként lesz véleményezve, amelyekhez javításokat lehet rögzíteni.
              </p>
            </div>

            {/* Document metadata (Deadline and Comments) */}
            <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ⏱️ Véleményezési Határidő
                </label>
                <input
                  type="date"
                  value={reviewDeadline}
                  onChange={(e) => setReviewDeadline(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  💡 Kísérő Megjegyzés / Megjegyzés
                </label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Pl: Kiemelt figyelem a minőségi pontokra..."
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Dokumentum Beküldése Véleményezésre
            </button>
          </form>
        </div>

        {/* Right Side: Submitted Documents & Details Drawer */}
        <div className="space-y-6" id="documents-list-section">
          <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <Clipboard className="w-5 h-5 text-slate-800" />
              Saját Beterjesztések ({myDocuments.length})
            </h2>

            {myDocuments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Ön még nem terjesztett be dokumentumot.</p>
                <p className="text-[10px] text-slate-400 mt-1">Saját sablon betöltésével azonnal megkezdheti.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {myDocuments.map((doc) => {
                  const statusInfo = getStatusLabel(doc.status);
                  const isViewing = viewingDoc?.id === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className={`p-3.5 border rounded-xl transition-all cursor-pointer ${
                        isViewing
                          ? 'border-slate-900 bg-slate-50/80 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      onClick={() => {
                        setViewingDoc(doc);
                        setShowExtendForm(false);
                        setExtendDeadlineVal(doc.reviewDeadline || '');
                      }}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0 select-none">
                          <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded-sm border shrink-0 ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                          {doc.status !== 'approved' && (
                            <button
                              type="button"
                              title="Beterjesztés törlése"
                              onClick={(e) => handleDeleteClick(e, doc.id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <div className="flex flex-wrap items-center gap-1.5 border-0">
                          <span>Beterjesztve: {new Date(doc.createdAt).toLocaleDateString('hu-HU')}</span>
                          {doc.status === 'approved' ? (
                            <>
                              <span>
                                Jóváhagyva: {(() => {
                                  const finalizeLog = doc.history.find(h => h.action.includes('JÓVÁHAGYTA') || h.id.endsWith('-finalize'));
                                  return finalizeLog ? new Date(finalizeLog.timestamp).toLocaleDateString('hu-HU') : new Date(doc.createdAt).toLocaleDateString('hu-HU');
                                })()}
                              </span>
                              {doc.extensionCount && doc.extensionCount > 0 ? (
                                <span className="text-amber-700 font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                  Meghosszabbítva: {doc.extensionCount} alkalommal
                                </span>
                              ) : null}
                            </>
                          ) : (
                            doc.reviewDeadline && (
                              <>
                                <span className="text-red-750 font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                  ⏱️ Határidő: {new Date(doc.reviewDeadline).toLocaleDateString('hu-HU')}
                                </span>
                                {doc.extensionCount && doc.extensionCount > 0 ? (
                                  <span className="text-amber-700 font-bold bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm shrink-0 select-none">
                                    Meghosszabbítva: {doc.extensionCount} alkalommal
                                  </span>
                                ) : null}
                              </>
                            )
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.2 rounded-xs">
                          <FileText className="w-3 h-3" />
                          {doc.paragraphs.length} bekezdés
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
 
          {/* Quick viewer section for selected document */}
          {viewingDoc && (
            <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 transition-all animate-fade-in" id="doc-viewer-modal">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">{viewingDoc.title}</h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Beküldő: {viewingDoc.creatorName} • {new Date(viewingDoc.createdAt).toLocaleString('hu-HU')}
                  </p>
                </div>
                <div className="flex items-center gap-2 select-none">
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-sm border ${
                    getStatusLabel(viewingDoc.status).color
                  }`}>
                    {getStatusLabel(viewingDoc.status).text}
                  </span>
                  {viewingDoc.status !== 'approved' && (
                    <button
                      type="button"
                      title="Beterjesztés törlése"
                      onClick={(e) => handleDeleteClick(e, viewingDoc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Deadline & Comment if available */}
              {(viewingDoc.reviewDeadline || viewingDoc.comment) && (
                <div className="mb-4 space-y-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-left">
                  {viewingDoc.reviewDeadline && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-slate-700">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold shrink-0">
                            ⏱️ Véleményezési határidő{viewingDoc.isDeadlineExtended ? ' (meghosszabbított)' : ''}:
                          </span>
                          <span className="font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shrink-0">
                            {new Date(viewingDoc.reviewDeadline).toLocaleDateString('hu-HU')}
                          </span>
                          {viewingDoc.extensionCount && viewingDoc.extensionCount > 0 ? (
                            <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 shrink-0">
                              Meghosszabbítva: {viewingDoc.extensionCount} alkalommal
                            </span>
                          ) : null}
                        </div>
                        
                        {!showExtendForm && viewingDoc.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => {
                              setExtendDeadlineVal(viewingDoc.reviewDeadline || '');
                              setShowExtendForm(true);
                            }}
                            className="text-[10px] font-bold text-slate-900 border border-slate-300 hover:border-slate-400 bg-white px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap"
                          >
                            Meghosszabbítás ⏱️
                          </button>
                        )}
                      </div>

                      {showExtendForm && (() => {
                        const minExtendDate = getMinExtendDate(viewingDoc.reviewDeadline);
                        const isDateValid = extendDeadlineVal && extendDeadlineVal >= minExtendDate;
                        return (
                          <div className="mt-2 p-3 bg-white border border-slate-200/85 rounded-xl flex flex-col gap-3 shadow-xs animate-fade-in w-full text-left">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <label className="block text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-0.5">Új Határidő</label>
                                <input
                                  type="date"
                                  value={extendDeadlineVal}
                                  min={minExtendDate}
                                  onChange={(e) => setExtendDeadlineVal(e.target.value)}
                                  className="block w-full px-2 py-1 border border-slate-200 bg-slate-50 text-slate-900 rounded-md text-xs font-sans focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                                />
                              </div>
                              <div className="flex gap-1.5 pt-4 shrink-0">
                                <button
                                  type="button"
                                  disabled={!isDateValid}
                                  onClick={() => {
                                    if (!extendDeadlineVal || !isDateValid) return;
                                    if (onExtendDeadline) {
                                      onExtendDeadline(viewingDoc.id, extendDeadlineVal);
                                      setViewingDoc({
                                        ...viewingDoc,
                                        reviewDeadline: extendDeadlineVal,
                                        isDeadlineExtended: true,
                                        extensionCount: (viewingDoc.extensionCount || 0) + 1,
                                        history: [
                                          ...viewingDoc.history,
                                          {
                                            id: `h-local-${Date.now()}`,
                                            userId: currentUser.id,
                                            userName: currentUser.name,
                                            userRole: currentUser.role,
                                            action: `Véleményezési határidő meghosszabbítva a következő dátumra: ${extendDeadlineVal}`,
                                            timestamp: new Date().toISOString(),
                                          }
                                        ]
                                      });
                                      setSuccessMessage('A határidő sikeresen meghosszabbításra került!');
                                      setShowExtendForm(false);
                                    }
                                  }}
                                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none ${
                                    isDateValid 
                                      ? 'bg-slate-950 hover:bg-slate-900 text-white' 
                                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                  }`}
                                >
                                  Mentés
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowExtendForm(false)}
                                  className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-150 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer select-none"
                                >
                                  Mégse
                                </button>
                              </div>
                            </div>
                            {(!isDateValid && extendDeadlineVal) ? (
                              <p className="text-[10px] text-red-600 font-medium">
                                ⚠️ A határidőt csak jövőbeli és a jelenleginél későbbi dátumra lehet meghosszabbítani! (Minimum: {new Date(minExtendDate).toLocaleDateString('hu-HU')})
                              </p>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {viewingDoc.comment && (
                    <div className="text-slate-700 flex flex-col gap-1 pt-1.5 border-t border-slate-200/40">
                      <span className="font-bold">💡 Kísérő Megjegyzés / Instrukció:</span>
                      <p className="bg-white border border-slate-200 p-2.5 rounded-lg italic text-slate-600 font-sans">
                        {viewingDoc.comment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Finalized Document Downloads Option */}
              {viewingDoc.status === 'approved' && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl text-left">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-650" />
                    Véglegesített dokumentum letöltése
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-normal mb-3 font-medium font-sans">
                    A dokumentum sikeresen véleményezve, lezárva és véglegesítve lett. Töltse le a módosításokkal frissített tiszta szöveget TXT vagy eredeti Word (.docx) formátumban:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(viewingDoc)}
                      className="px-3 py-1.5 bg-white border border-emerald-250 hover:bg-emerald-100/55 text-emerald-950 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Letöltés (.TXT)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadDocx(viewingDoc)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Letöltés (.DOCX)</span>
                    </button>
                  </div>
                </div>
              )}



              {/* Change/Audit History list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Eseménynapló & Életút
                </h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {viewingDoc.history.map((h) => (
                    <div key={h.id} className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-[10px] flex justify-between items-start gap-1">
                      <div className="text-left font-medium text-slate-700">
                        <strong className="text-slate-900">{h.userName}</strong> ({h.userRole}): <br />
                        <span className="text-slate-600">{h.action}</span>
                      </div>
                      <span className="text-[9px] font-mono whitespace-nowrap text-slate-400">
                        {new Date(h.timestamp).toLocaleTimeString('hu-HU')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 animate-fade-in transition-all">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="ml-2 text-slate-400 hover:text-white font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {docIdToDelete && (
        <div className="fixed inset-0 bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setDocIdToDelete(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900 mb-2 font-sans flex items-center gap-2 text-red-600">
              ⚠️ Beterjesztés Végleges Törlése
            </h3>
            <p className="text-xs text-slate-600 mb-4 font-sans leading-relaxed">
              Biztosan törölni szeretné a(z) <span className="font-extrabold text-slate-900">"{documents.find(d => d.id === docIdToDelete)?.title || 'dokumentum'}"</span> beterjesztett dokumentumot? Ez a törlés visszavonhatatlan és minden rendszer szereplőjénél (véleményezők, jóváhagyó) azonnal érvénybe lép.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDocIdToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none"
              >
                Mégse, megtartom
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDocument(docIdToDelete);
                  if (viewingDoc?.id === docIdToDelete) {
                    setViewingDoc(null);
                  }
                  setDocIdToDelete(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-lg cursor-pointer select-none"
              >
                Igen, törlöm végleg
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Metadata Import Prompter Modal */}
      {showImportModal && pendingFile && (
        <div 
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => {
            setPendingFile(null);
            setShowImportModal(false);
          }}
        >
          <div 
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark accent top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900" />
            
            <h3 className="text-base font-bold text-slate-900 mb-2 mt-2 font-sans flex items-center gap-2">
              📝 Dokumentum Alapadatok Megadása
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-sans">
              A beolvasott fájl feldolgozása előtt kérjük adja meg a véleményezéshez szükséges határidőt és kísérő megjegyzést.
            </p>

            <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-xs text-slate-600 mb-4 flex items-center gap-2">
              <span className="font-bold text-slate-700">Fájl:</span>
              <span className="font-mono truncate">{pendingFile.name}</span>
            </div>

            <form onSubmit={handleImportModalConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ⏱️ Véleményezési Határidő (kötelező)
                </label>
                <input
                  type="date"
                  required
                  value={tempDeadline}
                  onChange={(e) => setTempDeadline(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  💡 Kísérő Megjegyzés / Instrukció
                </label>
                <textarea
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  placeholder="Pl. Vizsgálják felül a 2. pontot..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-slate-950 focus:border-slate-950 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPendingFile(null);
                    setShowImportModal(false);
                  }}
                  className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-lg text-slate-700 bg-white cursor-pointer select-none"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-white rounded-lg cursor-pointer select-none"
                >
                  Mentés és beolvasás
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
