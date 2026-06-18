# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.2.2] - 2026-06-18

### Added
- **MANUAL.md**: user guide (in Hungarian) 

### Changed
- **README.md**: modified project description
 
## [0.2.1] - 2026-06-18

### Added
- **Preservation of Original Word (.docx) Layouts**: Integrated binary base64 storage (`originalDocxBase64` and `correctedDocxBase64`) for uploaded and revised documents. Download buttons across the Beterjesztő, Véleményező, and Jóváhagyó workspaces now prioritize downloading the actual formatted `.docx` files, fully preserving their original styles, margins, and track-changes rather than using auto-generated placeholders.
- **Embedded Demo Binary Documents**: Packed and embedded the base64 compiled asset binaries of *Informatikai Biztonsági Szabályzat* and *jogszabaly_minta.docx* (including the corrected *jogszabaly_minta_corr.docx*) directly into the application's initial database payload.

### Changed
- **Local Storage Schema Auto-Migration**: Enhanced LocalStorage initialization to automatically migrate outdated document schemas and dynamically seed the high-fidelity binary mock documents.

## [0.2.0] - 2026-06-15

### Added
- **Word (.docx) File Generation and Download**: Added support for reviewers and approvers to export finalized documents into Microsoft Word (.docx) format using the `docx` library.
- **Plaintext (.txt) File Download**: Added direct options to save finalized texts in clean, plain `.txt` files.
- **"Értesítések: Lezárt Folyamatok" Panel**: Introduced a dedicated Hungarian "Értesítések: Lezárt Folyamatok" list on the reviewer's workspace, summarizing approved submissions and highlighting those where the reviewer actively collaborated.
- **"Jóváhagyva: dátum" Date Display**: Replaced the "Véleményezési határidő" label on the "Saját Beterjesztések" panel with the actual approval date ("Jóváhagyva: YYYY. MM. DD.") for all finalized, approved documents.

### Changed
- **Jóváhagyott beterjesztések lezárása és védelme**:
  - Concealed deadline extension controls (hiding the "Meghosszabbítás" button) for finalized materials.
  - Disabled deletion capabilities (the trash/delete icon) for approved documents to preserve official document archives.
- **Állapotjelzők és vizualizáció**: Polished headings using celebratory laurel elements and distinct "Jóváhagyva & Véglegesítve" state headers for completed runs.

### Removed
- **Beterjesztések részletes bekezdésfolyama**: Removed the redundant paragraph listing panel from the "Saját Beterjesztések" detailed document viewer to reduce visual clutter.

---

## [0.1.0] - 2026-06-12

### Added
- **Felhasználói szerepkörök elkülönítése**: Specialized workspaces and view modes for Beterjesztő, Véleményező, Jóváhagyó, and Administrator roles.
- **Részletes véleményezési és korrektúra folyamat**: Structured capabilities to propose paragraph-level insertions, substitutions, and deletes.
- **LocalStorage alapú tartós tárolás**: Entirely client-side database management storing active drafts, session histories, and progress tracking records offline.
- **Eredeti dokumentum letöltési lehetőségek**: Initial support for tracking and serving original submission documents.
