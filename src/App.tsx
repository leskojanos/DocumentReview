/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Document, Paragraph, Suggestion, UserRole } from './types';
import { getStoredUsers, saveStoredUsers, getStoredDocuments, saveStoredDocuments } from './data';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import AdminView from './components/AdminView';
import BeterjesztoView from './components/BeterjesztoView';
import VelemenyezoView from './components/VelemenyezoView';
import JovahagyoView from './components/JovahagyoView';
import DockerConfigGuides from './components/DockerConfigGuides';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDockerGuide, setShowDockerGuide] = useState(false);

  // Initialize data from localStorage on component mount
  useEffect(() => {
    setUsers(getStoredUsers());
    setDocuments(getStoredDocuments());

    // Restore login session if available
    const session = localStorage.getItem('review_session');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem('review_session');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('review_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('review_session');
  };

  // Admin: Add a new user with secure password & role
  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveStoredUsers(updated);
  };

  // Admin: Delete a user
  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveStoredUsers(updated);
  };

  // Admin: Update/Maintain an existing user's details
  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveStoredUsers(updated);

    // If the administrator edited their own profile, update active session!
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('review_session', JSON.stringify(updatedUser));
    }
  };

  // Beterjeszto: Submit a draft document for review
  const handleAddDocument = (
    title: string,
    paragraphs: Paragraph[],
    originalDocxBase64?: string,
    reviewDeadline?: string,
    comment?: string
  ) => {
    if (!currentUser) return;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      createdAt: new Date().toISOString(),
      status: 'under_review', // Automatically goes to review queue
      paragraphs,
      originalDocxBase64,
      reviewDeadline,
      comment,
      history: [
        {
          id: `h-${Date.now()}-1`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: `Dokumentum feltöltve és beterjesztve véleményezésre.${
            reviewDeadline ? ` Határidő: ${reviewDeadline}.` : ''
          }`,
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveStoredDocuments(updated);
  };

  // Velemenyezo: Add correction suggestion to a paragraph
  const handleAddSuggestion = (
    docId: string,
    paragraphId: string,
    suggestionData: Omit<Suggestion, 'id' | 'timestamp'>
  ) => {
    if (!currentUser) return;

    const newSuggestion: Suggestion = {
      ...suggestionData,
      id: `sug-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      // Add feedback to paragraph
      const updatedParagraphs = doc.paragraphs.map((p) => {
        if (p.id !== paragraphId) return p;
        return {
          ...p,
          suggestions: [...p.suggestions, newSuggestion],
        };
      });

      // Add activity log to history
      const newHistoryLog = {
        id: `h-${Date.now()}-sug`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: `Korrektúrát rögzített: ${
          suggestionData.type === 'modify' ? 'Szövegmódosítás' :
          suggestionData.type === 'delete' ? 'Törlési javaslat' :
          suggestionData.type === 'insert' ? 'Beszúrási javaslat' : 'Megjegyzés'
        }`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        paragraphs: updatedParagraphs,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Velemenyezo: Set status (e.g. forward reviewed document to Approver)
  const handleSetStatus = (docId: string, status: 'reviewed' | 'under_review') => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      const newHistoryLog = {
        id: `h-${Date.now()}-status`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Korrektúrázás befejezve, továbbítva a Jóváhagyónak.',
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        status,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Velemenyezo: Update document paragraphs dynamically (e.g. from uploaded Word doc)
  const handleUpdateDocumentParagraphs = (docId: string, paragraphs: Paragraph[], originalDocxBase64?: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      const newHistoryLog = {
        id: `h-${Date.now()}-update-paragraphs`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'A valós Word-dokumentum szövege beolvasásra és szinkronizálásra került.',
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        paragraphs,
        originalDocxBase64: originalDocxBase64 || doc.originalDocxBase64,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Beterjeszto: Delete a submitted document
  const handleDeleteDocument = (docId: string) => {
    if (!currentUser) return;
    const updatedDocs = documents.filter((doc) => doc.id !== docId);
    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Beterjeszto: Extend the review deadline for a document
  const handleExtendDeadline = (docId: string, newDeadline: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      const newHistoryLog = {
        id: `h-${Date.now()}-extend-deadline`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: `Véleményezési határidő meghosszabbítva a következő dátumra: ${newDeadline}`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        reviewDeadline: newDeadline,
        isDeadlineExtended: true,
        extensionCount: (doc.extensionCount || 0) + 1,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Jovahagyo: Accept suggestion and merge changes into paragraph clean/currentText HTML
  const handleAcceptSuggestion = (docId: string, paragraphId: string, suggestionId: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      const updatedParagraphs = doc.paragraphs.map((p) => {
        if (p.id !== paragraphId) return p;

        // Find suggestion to mark active
        let updatedText = p.currentText;
        const updatedSuggestions = p.suggestions.map((sug) => {
          if (sug.id !== suggestionId) return sug;

          // Merge text dynamically
          if (sug.type === 'modify' && sug.highlightedText && sug.suggestedText) {
            // Replace the proposed segment
            const prevText = updatedText;
            updatedText = updatedText.replace(sug.highlightedText, sug.suggestedText);
            // If replace did not find it, fallback copy
            if (updatedText === prevText) {
              updatedText = sug.suggestedText;
            }
          } else if (sug.type === 'delete' && sug.highlightedText) {
            updatedText = updatedText.replace(sug.highlightedText, '').trim();
          } else if (sug.type === 'insert' && sug.suggestedText) {
            updatedText = `${updatedText} ${sug.suggestedText}`.trim();
          }

          return { ...sug, status: 'approved' as const };
        });

        return {
          ...p,
          currentText: updatedText,
          suggestions: updatedSuggestions,
        };
      });

      // Log accepted trigger
      const newHistoryLog = {
        id: `h-${Date.now()}-accept`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Elfogadta és beolvasztotta az egyik korrektúra módosítást.',
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        paragraphs: updatedParagraphs,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Jovahagyo: Reject suggestion
  const handleRejectSuggestion = (docId: string, paragraphId: string, suggestionId: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      const updatedParagraphs = doc.paragraphs.map((p) => {
        if (p.id !== paragraphId) return p;

        const updatedSuggestions = p.suggestions.map((sug) => {
          if (sug.id !== suggestionId) return sug;
          return { ...sug, status: 'rejected' as const };
        });

        return {
          ...p,
          suggestions: updatedSuggestions,
        };
      });

      // Log reject trigger
      const newHistoryLog = {
        id: `h-${Date.now()}-reject`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Elutasította az egyik javasolt javítást.',
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        paragraphs: updatedParagraphs,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Jovahagyo: Finalize and lock document ('approved' status)
  const handleFinalizeDocument = (docId: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map((doc) => {
      if (doc.id !== docId) return doc;

      // Mark all pending suggestions as rejected if they missed judgment
      const updatedParagraphs = doc.paragraphs.map((p) => {
        const cleanedSuggestions = p.suggestions.map((sug) => {
          if (sug.status === 'pending') {
            return { ...sug, status: 'rejected' as const };
          }
          return sug;
        });
        return {
          ...p,
          suggestions: cleanedSuggestions,
        };
      });

      const newHistoryLog = {
        id: `h-${Date.now()}-finalize`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'HIVATALOSAN JÓVÁHAGYTA ÉS VÉGLEGESÍTETTE A DOKUMENTUMOT.',
        timestamp: new Date().toISOString(),
      };

      return {
        ...doc,
        status: 'approved' as const,
        paragraphs: updatedParagraphs,
        history: [...doc.history, newHistoryLog],
      };
    });

    setDocuments(updatedDocs);
    saveStoredDocuments(updatedDocs);
  };

  // Route/View Selector helper based on logged user role
  const renderActiveView = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case 'admin':
        return (
          <AdminView
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            currentUser={currentUser}
          />
        );
      case 'beterjeszto':
        return (
          <BeterjesztoView
            documents={documents}
            currentUser={currentUser}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onExtendDeadline={handleExtendDeadline}
          />
        );
      case 'velemenyezo':
        return (
          <VelemenyezoView
            documents={documents}
            currentUser={currentUser}
            onAddSuggestion={handleAddSuggestion}
            onSetStatus={handleSetStatus}
            onUpdateParagraphs={handleUpdateDocumentParagraphs}
          />
        );
      case 'jovahagyo':
        return (
          <JovahagyoView
            documents={documents}
            currentUser={currentUser}
            onAcceptSuggestion={handleAcceptSuggestion}
            onRejectSuggestion={handleRejectSuggestion}
            onFinalizeDocument={handleFinalizeDocument}
          />
        );
      default:
        return (
          <div className="p-8 text-center" id="not-found-view">
            <p className="text-red-500 font-bold">Ismeretlen felhasználói jogosultság.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900" id="app-root">
      {currentUser ? (
        <>
          <Navbar
            user={currentUser}
            onLogout={handleLogout}
            onShowDockerGuide={() => setShowDockerGuide(true)}
          />
          <main className="flex-grow">
            {renderActiveView()}
          </main>
        </>
      ) : (
        <Login users={users} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Docker Deployment Guide Modal */}
      {showDockerGuide && (
        <DockerConfigGuides onClose={() => setShowDockerGuide(false)} />
      )}
    </div>
  );
}
