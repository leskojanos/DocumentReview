import { Document as DocxGen, Paragraph as DocxParagraphTag, TextRun, AlignmentType } from 'docx';

export const generateBeautifulDocx = (docTitle: string, paragraphsText: string[]): DocxGen => {
  const isGovernmentDecree = docTitle.includes('111/2026') || docTitle.toLowerCase().includes('rendelet') || docTitle.toLowerCase().includes('jogszabaly');
  const isSecurityRegulation = docTitle.toLowerCase().includes('biztonság') || docTitle.toLowerCase().includes('szabályzat');

  const docChildren: any[] = [];

  if (isGovernmentDecree) {
    // Hungarian government decree styling
    // Centered Title
    docChildren.push(
      new DocxParagraphTag({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, before: 300 },
        children: [
          new TextRun({
            text: "111/2026. (I. 22.) Korm. rendelet",
            bold: true,
            size: 32, // 16pt
            font: "Times New Roman",
          }),
        ],
      })
    );

    // Centered Subtitle
    docChildren.push(
      new DocxParagraphTag({
        alignment: AlignmentType.CENTER,
        spacing: { after: 450 },
        children: [
          new TextRun({
            text: "a jogszabályok elektronikus egyeztetési és véleményezési folyamatának részletes szabályozásáról",
            italics: true,
            bold: true,
            size: 24, // 12pt
            font: "Times New Roman",
          }),
        ],
      })
    );

    // Body paragraphs
    paragraphsText.forEach((text) => {
      // Find starting section marker like "1. §"
      const sectionMatch = text.match(/^(\d+\.\s*§)(.*)$/);
      let runChildren: TextRun[] = [];

      if (sectionMatch) {
        runChildren = [
          new TextRun({
            text: sectionMatch[1],
            bold: true,
            size: 24, // 12pt
            font: "Times New Roman",
          }),
          new TextRun({
            text: sectionMatch[2],
            size: 24,
            font: "Times New Roman",
          }),
        ];
      } else {
        runChildren = [
          new TextRun({
            text: text,
            size: 24,
            font: "Times New Roman",
          }),
        ];
      }

      docChildren.push(
        new DocxParagraphTag({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180, before: 80, line: 360 }, // standard legal line height and gaps
          children: runChildren,
        })
      );
    });

  } else if (isSecurityRegulation) {
    // Professional corporate handbook style
    // Centered main title
    docChildren.push(
      new DocxParagraphTag({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120, before: 300 },
        children: [
          new TextRun({
            text: "Informatikai Biztonsági Szabályzat",
            bold: true,
            size: 36, // 18pt
            font: "Arial",
          }),
        ],
      })
    );

    // Centered Subtitle
    docChildren.push(
      new DocxParagraphTag({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [
          new TextRun({
            text: "A TÁRSASÁG BELSŐ INFORMATIKAI BIZTONSÁGI PROTOKOLLJA",
            size: 20, // 10pt
            font: "Arial",
            color: "475569", // slate-600
          }),
        ],
      })
    );

    // Body paragraphs
    paragraphsText.forEach((text) => {
      docChildren.push(
        new DocxParagraphTag({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, before: 100, line: 320 },
          children: [
            new TextRun({
              text: text,
              size: 24, // 12pt
              font: "Arial",
            }),
          ],
        })
      );
    });

  } else {
    // High-quality standard fallback
    // Centered Title
    docChildren.push(
      new DocxParagraphTag({
        alignment: AlignmentType.CENTER,
        spacing: { after: 350 },
        children: [
          new TextRun({
            text: docTitle,
            bold: true,
            size: 32, // 16pt
            font: "Arial",
          }),
        ],
      })
    );

    // Body paragraphs
    paragraphsText.forEach((text) => {
      docChildren.push(
        new DocxParagraphTag({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180, line: 300 },
          children: [
            new TextRun({
              text: text,
              size: 24,
              font: "Arial",
            }),
          ],
        })
      );
    });
  }

  return new DocxGen({
    sections: [
      {
        properties: {},
        children: docChildren,
      },
    ],
  });
};
