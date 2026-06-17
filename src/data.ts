/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Document } from './types';
import { ibsOriginalB64, jogszabalyOriginalB64, jogszabalyCorrB64 } from './utils/demoDocxData';

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
    title: 'Informatikai Biztonsági Szabályzat',
    creatorId: '1',
    creatorName: 'Kovács Péter',
    createdAt: '2026-06-17T08:30:00Z',
    reviewDeadline: '2026-06-26T23:59:59Z',
    status: 'under_review',
    originalFilename: 'InformatikaiBiztonsagiSzabalyzat.docx',
    originalDocxBase64: ibsOriginalB64,
    paragraphs: [
      {
        id: 'p1',
        originalText: 'Ez a dokumentum rögzíti a Társaság informatikai hálózatának és hardver eszközeinek használatára vonatkozó kötelező biztonsági előírásokat, mindenegyes munkatársunk számára a mai naptól kezdődően.',
        currentText: 'Ez a dokumentum rögzíti a Társaság informatikai hálózatának és hardver eszközeinek használatára vonatkozó kötelező biztonsági előírásokat, mindenegyes munkatársunk számára a mai naptól kezdődően.',
        suggestions: []
      },
      {
        id: 'p2',
        originalText: 'A jelszavakat havonta egyszer meg kell változtatni. A jelszónak legalább 6 karakterből kell állnia, és tartalmaznia kell számokat is.',
        currentText: 'A jelszavakat havonta egyszer meg kell változtatni. A jelszónak legalább 6 karakterből kell állnia, és tartalmaznia kell számokat is.',
        suggestions: []
      },
      {
        id: 'p3',
        originalText: 'Tilos az irodai munkaállomásokon bármilyen külső adathordozót (pl. USB stick) használni a biztonsági engedélyek hiányában.',
        currentText: 'Tilos az irodai munkaállomásokon bármilyen külső adathordozót (pl. USB stick) használni a biztonsági engedélyek hiányában.',
        suggestions: []
      },
      {
        id: 'p4',
        originalText: 'A munkavállalók nem tölthetnek le ismeretlen forrásból származó szoftvereket a céges számítógépekre.',
        currentText: 'A munkavállalók nem tölthetnek le ismeretlen forrásból származó szoftvereket a céges számítógépekre.',
        suggestions: []
      }
    ],
    history: [
      {
        id: 'h1',
        userId: '1',
        userName: 'Kovács Péter',
        userRole: 'beterjeszto',
        action: 'Dokumentum feltöltve és beterjesztve véleményezésre.',
        timestamp: '2026-06-17T08:30:00Z'
      }
    ]
  },
  {
    id: 'doc-2',
    title: '111/2026. (I. 22.) Korm. rendelet',
    creatorId: '1',
    creatorName: 'Kovács Péter',
    createdAt: '2026-06-16T09:00:00Z',
    status: 'approved',
    originalFilename: 'jogszabaly_minta.docx',
    correctedFilename: 'jogszabaly_minta_corr.docx',
    originalDocxBase64: jogszabalyOriginalB64,
    correctedDocxBase64: jogszabalyCorrB64,
    paragraphs: [
      {
        id: 'p2-1',
        originalText: '1. § E rendelet célja a jogszabályok elektronikus egyeztetési és véleményezési folyamatának részletes szabályozása.',
        currentText: '1. § E rendelet célja a jogszabályok elektronikus egyeztetési és véleményezési folyamatának részletes szabályozása.',
        suggestions: []
      },
      {
        id: 'p2-2',
        originalText: '2. § A rendelet hatálya kiterjed a minisztériumok és kormányzati szervek által előkészített jogszabálytervezetekre.',
        currentText: '2. § A rendelet hatálya kiterjed a minisztériumok és kormányzati szervek által előkészített jogszabálytervezetekre.',
        suggestions: []
      },
      {
        id: 'p2-3',
        originalText: '3. § Az elektronikus biztonsági ellenőrzések folyamatában a Word alapú (.docx) formátum az irányadó.',
        currentText: '3. § Az elektronikus biztonsági ellenőrzések folyamatában a Word alapú (.docx) formátum az irányadó.',
        suggestions: []
      },
      {
        id: 'p2-4',
        originalText: '4. § Minden beterjesztett dokumentumot legalább egy független jogi szakértő véleményezőnek kell ellenőriznie.',
        currentText: '4. § Minden beterjesztett dokumentumot legalább egy független jogi szakértő véleményezőnek kell ellenőriznie.',
        suggestions: []
      },
      {
        id: 'p2-5',
        originalText: '5. § A véleményezési szakaszban rögzített javaslatok kizárólag bekezdés-szintű módosításként rögzíthetők.',
        currentText: '5. § A véleményezési szakaszban rögzített javaslatok kizárólag bekezdés-szintű módosításként rögzíthetők.',
        suggestions: []
      },
      {
        id: 'p2-6',
        originalText: '6. § A rendszer biztosítja a javasolt korrektúrák (beszúrás, törlés, módosítás) vizuális megkülönböztetését.',
        currentText: '6. § A rendszer biztosítja a javasolt korrektúrák (beszúrás, törlés, módosítás) vizuális megkülönböztetését.',
        suggestions: []
      },
      {
        id: 'p2-7',
        originalText: '7. § A véleményezési határidő alapértelmezetten a beterjesztéstől számított tíz munkanap.',
        currentText: '7. § A véleményezési határidő alapértelmezetten a beterjesztéstől számított tíz munkanap.',
        suggestions: []
      },
      {
        id: 'p2-8',
        originalText: '8. § Kivételes, indokolt esetben a beterjesztő kezdeményezheti a határidő legfeljebb egy alkalommal történő meghosszabbítását.',
        currentText: '8. § Kivételes, indokolt esetben a beterjesztő kezdeményezheti a határidő legfeljebb egy alkalommal történő meghosszabbítását.',
        suggestions: []
      },
      {
        id: 'p2-9',
        originalText: '9. § A jóváhagyó szerepkörrel rendelkező szervezet vezetője jogosult a korrektúrázott javaslatok véglegesítésére.',
        currentText: '9. § A jóváhagyó szerepkörrel rendelkező szervezet vezetője jogosult a korrektúrázott javaslatok véglegesítésére.',
        suggestions: []
      },
      {
        id: 'p2-10',
        originalText: '10. § A jóváhagyási folyamat lezárultával a dokumentum zárolásra kerül, és az eredeti archívumba kerül.',
        currentText: '10. § A jóváhagyási folyamat lezárultával a dokumentum zárolásra kerül, és az eredeti archívumba kerül.',
        suggestions: []
      },
      {
        id: 'p2-11',
        originalText: '11. § Az archívum részét képező dokumentumok letölthetők .docx és .txt formátumokban egyaránt.',
        currentText: '11. § Az archívum részét képező dokumentumok letölthetők .docx és .txt formátumokban egyaránt.',
        suggestions: []
      },
      {
        id: 'p2-12',
        originalText: '12. § A dokumentumok módosítási előzményeit és a résztvevők naplózását a rendszer visszakereshetően tárolja.',
        currentText: '12. § A dokumentumok módosítási előzményeit és a résztvevők naplózását a rendszer visszakereshetően tárolja.',
        suggestions: []
      },
      {
        id: 'p2-13',
        originalText: '13. § Jogosulatlan hozzáférés vagy módosítási kísérlet esetén a rendszer azonnali biztonsági riasztást küld.',
        currentText: '13. § Jogosulatlan hozzáférés vagy módosítási kísérlet esetén a rendszer azonnali biztonsági riasztást küld.',
        suggestions: []
      },
      {
        id: 'p2-14',
        originalText: '14. § A kormányzati hálózat és az adatok LocalStorage-on történő titkosított tárolása garantálja a folyamat integritását.',
        currentText: '14. § A kormányzati hálózat és az adatok LocalStorage-on történő titkosított tárolása garantálja a folyamat integritását.',
        suggestions: []
      },
      {
        id: 'p2-15',
        originalText: '15. § A felhasználói jogosultságok ellenőrzése többszintű biztonsági kulcsokkal és szerepkör-alapú hitelesítéssel történik.',
        currentText: '15. § A felhasználói jogosultságok ellenőrzése többszintű biztonsági kulcsokkal és szerepkör-alapú hitelesítéssel történik.',
        suggestions: []
      },
      {
        id: 'p2-16',
        originalText: '16. § Az eljárás során felhasznált minden elektronikus aláírás megfelel a vonatkozó hazai és EU-s eIDAS irányelveknek.',
        currentText: '16. § Az eljárás során felhasznált minden elektronikus aláírás megfelel a vonatkozó hazai és EU-s eIDAS irányelveknek.',
        suggestions: []
      },
      {
        id: 'p2-17',
        originalText: '17. § A rendelet mellékletében meghatározott hivatalos sablonok használata a kormányzati szervek számára kötelező.',
        currentText: '17. § A rendelet mellékletében meghatározott hivatalos sablonok használata a kormányzati szervek számára kötelező.',
        suggestions: []
      },
      {
        id: 'p2-18',
        originalText: '18. § A technikai részleteket és a felület kezelési kézikönyvét a Rendszergazda köteles folyamatosan frissíteni.',
        currentText: '18. § A technikai részleteket és a felület kezelési kézikönyvét a Rendszergazda köteles folyamatosan frissíteni.',
        suggestions: []
      },
      {
        id: 'p2-19',
        originalText: '19. § Jelen rendelet a kihirdetését követő napon lép hatályba.',
        currentText: '19. § Jelen rendelet a kihirdetését követő napon lép hatályba.',
        suggestions: []
      },
      {
        id: 'p2-20',
        originalText: '20. § E rendelet végrehajtásáért a digitális állampolgárságért felelős miniszter felel.',
        currentText: '20. § E rendelet végrehajtásáért a digitális állampolgárságért felelős miniszter felel.',
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
        timestamp: '2026-06-16T09:00:00Z'
      },
      {
        id: 'h2-2',
        userId: '2',
        userName: 'Szabó Anna',
        userRole: 'velemenyezo',
        action: 'Véleményezés és korrektúrázás elvégezve, jóváhagyásra továbbítva.',
        timestamp: '2026-06-17T09:30:00Z'
      },
      {
        id: 'h2-finalize',
        userId: '3',
        userName: 'Tóth Gábor',
        userRole: 'jovahagyo',
        action: 'A dokumentumot JÓVÁHAGYTA és véglegesítette a Jóváhagyó.',
        timestamp: '2026-06-17T11:00:00Z'
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
  if (!docs || docs.includes('Informatikai Adatbiztonsági Szabályzat v1.2') || docs.includes('Munkaszerződés Minta') || !docs.includes('originalDocxBase64') || !docs.includes('correctedDocxBase64')) {
    localStorage.setItem('review_documents', JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  }
  return JSON.parse(docs);
};

export const saveStoredDocuments = (docs: Document[]) => {
  localStorage.setItem('review_documents', JSON.stringify(docs));
};
