import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../contexts/ThemeContext';

const STATUS_COLORS = {
  Available: 'success', Sold: 'error', Reserved: 'warning', Coming: 'info', 'Under Repair': 'warning',
  Paid: 'success', Partial: 'warning', Pending: 'warning', Unpaid: 'error',
  Active: 'success', Inactive: 'error', Overdue: 'error',
  success: 'success', error: 'error', warning: 'warning', info: 'info',
};

const TYPE_COLORS = {
  'Exchange Car': '#1565c0', 'Container One Key': '#e65100', 'Licensed Car': '#2e7d32',
  Buyer: '#1565c0', Investor: '#7b1fa2', Borrower: '#b71c1c',
  Lent: '#ed6c02', Borrowed: '#2e7d32', 'Owner Loan': '#7b1fa2',
  Income: '#2e7d32', Expense: '#b71c1c', 'Vehicle Purchase': '#1565c0', 'Vehicle Sale': '#2e7d32',
  Salary: '#e65100', 'Currency Exchange': '#00695c', 'Loan Given': '#ed6c02', 'Loan Received': '#7b1fa2', Commission: '#c8963e',
  'Super Admin': '#b71c1c', Owner: '#7b1fa2', Manager: '#1565c0', Accountant: '#e65100',
  Financial: '#00695c', 'Inventory & Sales': '#2e7d32', Sales: '#1565c0', Viewer: '#757575',
};

export default function StatusChip({ label, type, style }) {
  const { paperTheme } = useAppTheme();
  const c = paperTheme.colors;

  const statusKey = STATUS_COLORS[label];
  let bgColor, textColor, dotColor;

  if (statusKey) {
    textColor = c[statusKey] || '#757575';
    bgColor = textColor + '15';
    dotColor = textColor;
  } else if (TYPE_COLORS[label]) {
    textColor = TYPE_COLORS[label];
    bgColor = textColor + '15';
    dotColor = textColor;
  } else {
    bgColor = c.surfaceVariant;
    textColor = c.onSurfaceVariant;
    dotColor = c.onSurfaceVariant;
  }

  return (
    <View style={[styles.chip, { backgroundColor: bgColor }, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
});
