import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VerificationRecord } from '../types/index.ts';

export function generateVerificationPDF(record: VerificationRecord, userEmail?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper colors
  const primaryCyan: [number, number, number] = [32, 217, 245];
  const darkNavy: [number, number, number] = [8, 13, 24];
  const verifiedGreen: [number, number, number] = [37, 214, 149];
  const refutedRed: [number, number, number] = [255, 93, 112];
  const warningAmber: [number, number, number] = [255, 190, 85];
  const textMuted: [number, number, number] = [120, 135, 155];

  // Header Banner
  doc.setFillColor(...darkNavy);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setFillColor(...primaryCyan);
  doc.rect(0, 42, pageWidth, 1.5, 'F');

  // Brand title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryCyan);
  doc.text('TRUSTX AI', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(240, 245, 255);
  doc.text('UNIVERSAL AI TRUST VERIFICATION & RISK ANALYSIS SYSTEM', 14, 25);
  doc.text('Evidence Before Trust • Independent External Verification', 14, 32);

  // Verification Metadata Block (Right aligned)
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`REPORT ID: ${record.verificationId}`, pageWidth - 14, 16, { align: 'right' });
  doc.text(`DATE: ${new Date(record.createdAt).toLocaleDateString()} ${new Date(record.createdAt).toLocaleTimeString()}`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`SOURCE AI: ${record.sourceAI || 'External Model'}`, pageWidth - 14, 28, { align: 'right' });
  if (userEmail) {
    doc.text(`AUDITOR: ${userEmail}`, pageWidth - 14, 34, { align: 'right' });
  }

  let yCursor = 52;

  // Verification Title & Status
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(record.title || 'Verification Assessment Report', 14, yCursor);

  yCursor += 7;

  // Status Badge
  const statusLabel = record.assessment?.overallLabel || 'Assessment Complete';
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  if (statusLabel === 'Evidence-aligned') {
    doc.setTextColor(...verifiedGreen);
  } else if (statusLabel === 'High-risk findings detected') {
    doc.setTextColor(...refutedRed);
  } else {
    doc.setTextColor(...warningAmber);
  }
  doc.text(`ASSESSMENT CLASSIFICATION: ${statusLabel.toUpperCase()}`, 14, yCursor);

  yCursor += 8;

  // Executive Summary Box
  doc.setFillColor(245, 248, 252);
  doc.setDrawColor(220, 230, 242);
  doc.roundedRect(14, yCursor, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 70);
  const summaryText =
    record.assessment?.summaryExplanation ||
    'Independent verification analysis evaluated factual assertions, external search grounding evidence, internal consistency, and code vulnerability markers.';
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 36);
  doc.text(splitSummary, 18, yCursor + 7);

  yCursor += 28;

  // Multi-dimensional metrics summary table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Multi-Dimensional Trust Metrics', 14, yCursor);

  yCursor += 4;

  const metricsData = [
    ['Factuality Alignment', record.assessment?.factualityDisplay || 'N/A', 'Supported / (Supported + Refuted Claims)'],
    ['Evidence Coverage', record.assessment?.evidenceCoverageDisplay || 'N/A', 'Evaluated Claims / Total Verifiable'],
    ['Contradiction Frequency', record.assessment?.contradictionDisplay || '0 detected', 'Cross-statement conflicting facts'],
    ['Citation Reliability', record.assessment?.citationReliabilityDisplay || 'Not applicable', 'Crossref / OpenAlex DOI verification'],
    ['Code Security Posture', record.assessment?.codeSecurityDisplay || 'Not applicable', 'Deterministic AST/Static vulnerability scan'],
  ];

  autoTable(doc, {
    startY: yCursor,
    head: [['Metric Dimension', 'Score / Status', 'Evaluation Criteria']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [17, 29, 48], textColor: [240, 245, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [30, 40, 55] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 55 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: 14, right: 14 },
  });

  yCursor = (doc as any).lastAutoTable.finalY + 10;

  // Claims Breakdown Table
  if (record.claims && record.claims.length > 0) {
    if (yCursor > pageHeight - 50) {
      doc.addPage();
      yCursor = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Extracted Claims & Evidence Corroboration (${record.claims.length} claims)`, 14, yCursor);
    yCursor += 4;

    const claimsData = record.claims.map((c) => [
      c.claimId,
      c.normalisedClaim,
      c.verificationStatus || 'UNVERIFIED',
      c.confidence ? `${Math.round(c.confidence * 100)}%` : 'N/A',
      c.explanation || 'Verified with external search grounding.',
    ]);

    autoTable(doc, {
      startY: yCursor,
      head: [['ID', 'Proposition / Claim', 'Status', 'Confidence', 'Evidence Analysis']],
      body: claimsData,
      theme: 'grid',
      headStyles: { fillColor: [17, 29, 48], textColor: [240, 245, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 40, 55] },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 60 },
        2: { cellWidth: 28, fontStyle: 'bold' },
        3: { cellWidth: 20 },
        4: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const val = String(data.cell.raw);
          if (val === 'SUPPORTED') {
            data.cell.styles.textColor = [20, 150, 90];
          } else if (val === 'REFUTED') {
            data.cell.styles.textColor = [210, 40, 60];
          } else {
            data.cell.styles.textColor = [190, 130, 20];
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    yCursor = (doc as any).lastAutoTable.finalY + 10;
  }

  // Citations Table (if applicable)
  if (record.citations && record.citations.length > 0) {
    if (yCursor > pageHeight - 50) {
      doc.addPage();
      yCursor = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Academic Citation Verification (Crossref & OpenAlex)', 14, yCursor);
    yCursor += 4;

    const citationData = record.citations.map((c) => [
      c.citationId,
      c.submittedCitation,
      c.status,
      c.retrievedTitle || 'Not Found',
      c.mismatchDetails || 'Metadata verified in registry.',
    ]);

    autoTable(doc, {
      startY: yCursor,
      head: [['Citation ID', 'Submitted Reference', 'Status', 'Retrieved Publication', 'Audit Findings']],
      body: citationData,
      theme: 'grid',
      headStyles: { fillColor: [17, 29, 48], textColor: [240, 245, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 40, 55] },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 28, fontStyle: 'bold' },
        3: { cellWidth: 40 },
        4: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
    });

    yCursor = (doc as any).lastAutoTable.finalY + 10;
  }

  // Code Security Findings Table (if applicable)
  if (record.securityFindings && record.securityFindings.length > 0) {
    if (yCursor > pageHeight - 50) {
      doc.addPage();
      yCursor = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Code Security Analysis Findings (${record.securityFindings.length} vulnerabilities detected)`, 14, yCursor);
    yCursor += 4;

    const secData = record.securityFindings.map((f) => [
      f.findingId,
      f.name,
      f.severity,
      `Line ${f.lineNumber}`,
      f.explanation,
      f.remediation,
    ]);

    autoTable(doc, {
      startY: yCursor,
      head: [['ID', 'Vulnerability', 'Severity', 'Location', 'Risk Description', 'Remediation Advice']],
      body: secData,
      theme: 'grid',
      headStyles: { fillColor: [17, 29, 48], textColor: [240, 245, 255], fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: [30, 40, 55] },
      columnStyles: {
        0: { cellWidth: 16, fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 20, fontStyle: 'bold' },
        3: { cellWidth: 18 },
        4: { cellWidth: 45 },
        5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const val = String(data.cell.raw);
          if (val === 'Critical') data.cell.styles.textColor = [210, 40, 60];
          else if (val === 'High') data.cell.styles.textColor = [230, 90, 40];
          else if (val === 'Medium') data.cell.styles.textColor = [190, 130, 20];
        }
      },
      margin: { left: 14, right: 14 },
    });

    yCursor = (doc as any).lastAutoTable.finalY + 10;
  }

  // Disclaimer and Footer
  if (yCursor > pageHeight - 35) {
    doc.addPage();
    yCursor = 20;
  }

  doc.setFillColor(248, 249, 250);
  doc.rect(14, yCursor, pageWidth - 28, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 90, 110);
  doc.text('SYSTEM LIMITATIONS & METHODOLOGY DISCLAIMER', 18, yCursor + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 120, 140);
  const disclaimer =
    'TRUSTX AI performs empirical evidence correlation using Google Search grounding, Crossref academic DOI queries, and deterministic static code security rules. Verification scores represent evidence alignment confidence and do not guarantee 100% objective factual infallibility or exhaustiveness. Results should be reviewed by qualified human auditors.';
  const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - 36);
  doc.text(splitDisc, 18, yCursor + 11);

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`TRUSTX AI Report — ID: ${record.verificationId}`, 14, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }

  // Save the PDF
  doc.save(`TRUSTX-AI-Report-${record.verificationId}.pdf`);
}
