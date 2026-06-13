/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Document } from './types';

// Predefined testing users
export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Kovács Péter',
    email: 'kovacs.peter@vps.hu',
    role: 'beterjeszto',
    password: 'beterjeszto123',
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Szabó Anna',
    email: 'szabo.anna@vps.hu',
    role: 'velemenyezo',
    password: 'velemenyezo123',
    createdAt: '2026-05-10T11:00:00Z',
  },
  {
    id: '3',
    name: 'Tóth Gábor',
    email: 'toth.gabor@vps.hu',
    role: 'jovahagyo',
    password: 'jovahagyo123',
    createdAt: '2026-05-10T12:00:00Z',
  },
  {
    id: '4',
    name: 'Nagy Zsolt (Rendszergazda)',
    email: 'admin@vps.hu',
    role: 'admin',
    password: 'adminsecure123',
    createdAt: '2026-05-01T09:00:00Z',
  },
];

// Predefined corporate policy document that is already reviewed and has modifications to approve, plus a draft
export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Informatikai Adatbiztonsági Szabályzat v1.2',
    creatorId: '1',
    creatorName: 'Kovács Péter',
    createdAt: '2026-06-12T08:30:00Z',
    status: 'reviewed',
    paragraphs: [
      {
        id: 'p1',
        originalText: 'Ez a dokumentum rögzíti a Társaság informatikai hálózatának és hardver eszközeinek használatára vonatkozó kötelező biztonsági előírásokat, mindenegyes munkatársunk számára a mai naptól kezdődően.',
        currentText: 'Ez a dokumentum rögzíti a Társaság informatikai hálózatának és hardver eszközeinek használatára vonatkozó kötelező biztonsági előírásokat, mindenegyes munkatársunk számára a mai naptól kezdődően.',
        suggestions: [
          {
            id: 'sug-1',
            reviewer: 'Szabó Anna',
            type: 'modify',
            highlightedText: 'mindenegyes munkatársunk számára',
            suggestedText: 'minden munkavállaló és partner számára',
            comment: 'Pontosabb megfogalmazás, mivel a külső partnerekre is vonatkoznia kell.',
            status: 'pending',
            timestamp: '2026-06-12T14:15:00Z'
          }
        ]
      },
      {
        id: 'p2',
        originalText: 'A jelszavakat havonta egyszer meg kell változtatni. A jelszónak legalább 6 karakterből kell állnia, és tartalmaznia kell számokat is.',
        currentText: 'A jelszavakat havonta egyszer meg kell változtatni. A jelszónak legalább 6 karakterből kell állnia, és tartalmaznia kell számokat is.',
        suggestions: [
          {
            id: 'sug-2',
            reviewer: 'Szabó Anna',
            type: 'modify',
            highlightedText: 'legalább 6 karakterből',
            suggestedText: 'legalább 12 karakterből, kis- és nagybetűvel, speciális karakterrel',
            comment: 'A 6 karakteres jelszó manapság rendkívül sebezhető. Emeljük fel 12-re!',
            status: 'pending',
            timestamp: '2026-06-12T14:17:00Z'
          },
          {
            id: 'sug-3',
            reviewer: 'Szabó Anna',
            type: 'insert',
            highlightedText: 'havonta egyszer',
            suggestedText: 'illetve gyanús tevékenység észlelésekor azonnal',
            comment: 'Kiegészítés a biztonsági protokollhoz.',
            status: 'pending',
            timestamp: '2026-06-12T14:18:00Z'
          }
        ]
      },
      {
        id: 'p3',
        originalText: 'Tilos az irodai munkaállomásokon bármilyen külső adathordozót (pl. USB stick) használni a biztonsági engedélyek hiányában.',
        currentText: 'Tilos az irodai munkaállomásokon bármilyen külső adathordozót (pl. USB stick) használni a biztonsági engedélyek hiányában.',
        suggestions: []
      },
      {
        id: 'p4',
        originalText: 'A munkavállalók nem tölthetnek le ismeretlen forrásból származó szoftvereket, játékokat a céges számítógépekre.',
        currentText: 'A munkavállalók nem tölthetnek le ismeretlen forrásból származó szoftvereket, játékokat a céges számítógépekre.',
        suggestions: [
          {
            id: 'sug-4',
            reviewer: 'Szabó Anna',
            type: 'delete',
            highlightedText: 'játékokat',
            comment: 'A szoftverek fogalma már magában foglalja a játékokat is, felesleges külön megnevezni.',
            status: 'pending',
            timestamp: '2026-06-12T14:20:00Z'
          }
        ]
      }
    ],
    history: [
      {
        id: 'h1',
        userId: '1',
        userName: 'Kovács Péter',
        userRole: 'beterjeszto',
        action: 'Dokumentum feltöltve és beterjesztve véleményezésre.',
        timestamp: '2026-06-12T08:30:00Z'
      },
      {
        id: 'h2',
        userId: '2',
        userName: 'Szabó Anna',
        userRole: 'velemenyezo',
        action: 'Véleményezés és korrektúrázás elvégezve, jóváhagyásra továbbítva.',
        timestamp: '2026-06-12T14:22:00Z'
      }
    ]
  },
  {
    id: 'doc-2',
    title: 'Munkaszerződés Minta 2026_Standard',
    creatorId: '1',
    creatorName: 'Kovács Péter',
    createdAt: '2026-06-13T09:00:00Z',
    status: 'under_review',
    paragraphs: [
      {
        id: 'p2-1',
        originalText: 'A munkavállaló napi munkaideje teljes állás esetén 8 óra, amelyet a munkáltató telephelyén köteles letölteni.',
        currentText: 'A munkavállaló napi munkaideje teljes állás esetén 8 óra, amelyet a munkáltató telephelyén köteles letölteni.',
        suggestions: []
      },
      {
        id: 'p2-2',
        originalText: 'A próbaidő tartama 3 hónap, amely alatt a felek a jogviszonyt indokolás nélkül azonnali hatállyal megszüntethetik.',
        currentText: 'A próbaidő tartama 3 hónap, amely alatt a felek a jogviszonyt indokolás nélkül azonnali hatállyal megszüntethetik.',
        suggestions: []
      },
      {
        id: 'p2-3',
        originalText: 'A munkatársa köteles a rábízott üzleti titkokat teljes titoktartással kezelni mind a jogviszony alatt, mind annak megszűnése után.',
        currentText: 'A munkatársa köteles a rábízott üzleti titkokat teljes titoktartással kezelni mind a jogviszony alatt, mind annak megszűnése után.',
        suggestions: []
      }
    ],
    history: [
      {
        id: 'h2-1',
        userId: '1',
        userName: 'Kovács Péter',
        userRole: 'beterjeszto',
        action: 'Dokumentum feltöltve és beterjesztve véleményezésre.',
        timestamp: '2026-06-13T09:00:00Z'
      }
    ]
  }
];

// Helper to retrieve current state from localStorage, or defaults if empty
export const getStoredUsers = (): User[] => {
  const users = localStorage.getItem('review_users');
  if (!users) {
    localStorage.setItem('review_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  return JSON.parse(users);
};

export const saveStoredUsers = (users: User[]) => {
  localStorage.setItem('review_users', JSON.stringify(users));
};

export const getStoredDocuments = (): Document[] => {
  const docs = localStorage.getItem('review_documents');
  if (!docs) {
    localStorage.setItem('review_documents', JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  return JSON.parse(docs);
};

export const saveStoredDocuments = (docs: Document[]) => {
  localStorage.setItem('review_documents', JSON.stringify(docs));
};
