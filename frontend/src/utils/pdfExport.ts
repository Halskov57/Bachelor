import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TaskForPDF {
  id: string;
  title: string;
  status: string;
  assignedUsers: string[];
  epicTitle?: string;
  featureTitle?: string;
  description?: string;
}

export const exportTasksToPDF = async (
  tasks: TaskForPDF[],
  projectTitle: string,
  filterType?: string,
  filterValue?: string
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  // Header
  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text('User Tasks Report', margin, 25);
  
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Project: ${projectTitle}`, margin, 35);
  
  if (filterType && filterValue) {
    pdf.text(`Filter: ${filterType} = ${filterValue}`, margin, 45);
  }
  
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, filterType ? 55 : 45);
  pdf.text(`Total Tasks: ${tasks.length}`, margin, filterType ? 65 : 55);

  let yPosition = filterType ? 80 : 70;

  // Table headers
  const headers = ['#', 'Task Title', 'Status', 'Users', 'Part Of'];
  const columnWidths = [15, 60, 25, 45, 35];
  const startX = margin;

  // Draw table header background
  pdf.setFillColor(2, 42, 255); // #022AFF
  pdf.rect(startX, yPosition - 5, pageWidth - 2 * margin, 10, 'F');
  
  // Draw table header text
  pdf.setFontSize(11);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(255, 255, 255); // White text
  
  let currentX = startX;
  headers.forEach((header, index) => {
    // Draw header text with better positioning
    pdf.text(header, currentX + 2, yPosition + 1);
    currentX += columnWidths[index];
  });

  yPosition += 10;
  pdf.setTextColor(0, 0, 0); // Reset to black text
  pdf.setFont(undefined, 'normal');

  // Draw table rows
  tasks.forEach((task, index) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 25;
    }

    // Row data
    const rowData = [
      (index + 1).toString(),
      task.title || 'Untitled',
      task.status || 'No Status',
      task.assignedUsers?.join(', ') || 'Unassigned',
      `${task.epicTitle || ''}${task.featureTitle ? ` / ${task.featureTitle}` : ''}` || 'No Epic/Feature'
    ];

    // Calculate flexible row height based on text content
    let maxLines = 1;
    const splitTextArray: string[][] = [];
    
    rowData.forEach((data, colIndex) => {
      const maxWidth = columnWidths[colIndex] - 4;
      const lines = pdf.splitTextToSize(data, maxWidth);
      splitTextArray.push(lines);
      maxLines = Math.max(maxLines, lines.length);
    });

    const baseRowHeight = 12;
    const lineHeight = 5;
    const rowHeight = baseRowHeight + (maxLines - 1) * lineHeight;

    currentX = startX;

    // Alternate row background with flexible height
    if (index % 2 === 0) {
      pdf.setFillColor(248, 249, 250);
      pdf.rect(startX, yPosition - 2, pageWidth - 2 * margin, rowHeight, 'F');
    }

    // Draw text with flexible positioning
    splitTextArray.forEach((lines, colIndex) => {
      const startY = yPosition + 3;
      lines.forEach((line, lineIndex) => {
        pdf.text(line, currentX + 2, startY + lineIndex * lineHeight);
      });
      currentX += columnWidths[colIndex];
    });

    yPosition += rowHeight;
  });

  // Footer
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
  }

  // Save the PDF
  const fileName = `${projectTitle.replace(/[^a-z0-9]/gi, '_')}_tasks_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const exportTableElementToPDF = async (
  elementId: string,
  filename: string = 'user_tasks_report.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const scaledWidth = imgWidth * ratio * 0.75; // 0.75 for better fitting
    const scaledHeight = imgHeight * ratio * 0.75;
    
    const x = (pdfWidth - scaledWidth) / 2;
    const y = 10;

    pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};