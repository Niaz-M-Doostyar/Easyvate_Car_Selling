import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

const STATUS_COLORS = {
  // Vehicle
  Available: 'success', Sold: 'error', Reserved: 'warning', Coming: 'info', 'Under Repair': 'warning',
  // Sale
  Paid: 'success', Partial: 'warning', Pending: 'warning', Unpaid: 'error',
  // Employee
  Active: 'success', Inactive: 'error',
  // Loan
  Open: 'warning',
  // Payroll
  // Generic
  success: 'success', error: 'error', warning: 'warning', info: 'info',
};

const TYPE_COLORS = {
  'Exchange Car': '#1565c0', 'Container One Key': '#e65100', 'Licensed Car': '#2e7d32',
  Buyer: '#1565c0', Investor: '#7b1fa2', 'Capital Provider': '#e65100', Borrower: '#b71c1c',
  Lent: '#ed6c02', Borrowed: '#2e7d32', 'Owner Loan': '#7b1fa2',
  Income: '#2e7d32', Expense: '#b71c1c', 'Vehicle Purchase': '#1565c0', 'Vehicle Sale': '#2e7d32',
  Salary: '#e65100', 'Currency Exchange': '#00695c', 'Loan Given': '#ed6c02', 'Loan Received': '#7b1fa2', Commission: '#c8963e',
  'Super Admin': '#b71c1c', Owner: '#7b1fa2', Manager: '#1565c0', Accountant: '#e65100',
  Financial: '#00695c', 'Inventory & Sales': '#2e7d32', Sales: '#1565c0', Viewer: '#757575',
};

export default function StatusChip({ label, type, style }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  // Try status color first, then type color
  const statusKey = STATUS_COLORS[label];
  let bgColor, textColor;

  if (statusKey) {
    bgColor = (c[statusKey] || '#757575') + '20';
    textColor = c[statusKey] || '#757575';
  } else if (TYPE_COLORS[label]) {
    bgColor = TYPE_COLORS[label] + '20';
    textColor = TYPE_COLORS[label];
  } else {
    bgColor = c.surfaceVariant;
    textColor = c.onSurfaceVariant;
  }

  return (
    <Chip
      mode="flat"
      compact
      style={[styles.chip, { backgroundColor: bgColor }, style]}
      textStyle={[styles.text, { color: textColor }]}
    >
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 8, height: 28 },
  text: { fontSize: 12, fontWeight: '600' },
});
