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
      console.error('Export failed:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || tasks.length === 0}
      style={{
        padding: '8px 16px',
        backgroundColor: '#022AFF',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: isExporting || tasks.length === 0 ? 'not-allowed' : 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        opacity: isExporting || tasks.length === 0 ? 0.6 : 1,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onMouseEnter={(e) => {
        if (!isExporting && tasks.length > 0) {
          (e.target as HTMLElement).style.backgroundColor = '#001a66';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExporting && tasks.length > 0) {
          (e.target as HTMLElement).style.backgroundColor = '#022AFF';
        }
      }}
    >
      {isExporting ? 'Generating PDF...' : 'Export as PDF'}
    </button>
  );
};

export default PDFExportButton;