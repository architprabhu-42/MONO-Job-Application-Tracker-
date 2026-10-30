import { formatDate, resumeLabel } from './format.js';

function cell(value) {
  let text = value == null ? '' : String(value);
  // Prevent spreadsheet formula injection.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportApplicationsCsv(applications) {
  const headers = [
    'Company',
    'Job title',
    'Job type',
    'Status',
    'Date applied',
    'Location',
    'Work arrangement',
    'Salary range',
    'Resume',
    'Recruiter',
    'Recruiter email',
    'Job URL',
    'Follow-up date',
    'Notes',
  ];
  const rows = applications.map((a) => [
    a.company,
    a.position,
    a.jobType,
    a.status,
    formatDate(a.dateApplied),
    a.location,
    a.workArrangement,
    a.salaryRange,
    resumeLabel(a.resumeId),
    a.recruiterName,
    a.recruiterEmail,
    a.jobUrl,
    a.followUpDate ? formatDate(a.followUpDate) : '',
    a.notes,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mono-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
