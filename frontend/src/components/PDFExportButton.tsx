import React, { useState } from 'react';
import { exportTasksToPDF, exportTableElementToPDF, TaskForPDF } from '../utils/pdfExport';

interface PDFExportButtonProps {
  tasks: TaskForPDF[];
  projectTitle: string;
  filterType?: string;
  filterValue?: string;
  tableElementId?: string;
  variant?: 'data' | 'visual';
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  tasks,
  projectTitle,
  filterType,
  filterValue,
  tableElementId,
  variant = 'data'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (variant === 'visual' && tableElementId) {
        await exportTableElementToPDF(
          tableElementId,
          `${projectTitle.replace(/[^a-z0-9]/gi, '_')}_tasks_visual_${new Date().toISOString().split('T')[0]}.pdf`
        );
      } else {
        await exportTasksToPDF(tasks, projectTitle, filterType, filterValue);
      }
    } catch (error) {
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || tasks.length === 0}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer text-sm font-medium transition-all duration-200 flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isExporting ? 'Generating PDF...' : 'Export as PDF'}
    </button>
  );
};

export default PDFExportButton;