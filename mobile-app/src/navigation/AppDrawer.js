import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_ACCESS } from '../utils/constants';
import DrawerContent from './DrawerContent';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import VehicleFormScreen from '../screens/VehicleFormScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import CustomersScreen from '../screens/CustomersScreen';
import CustomerFormScreen from '../screens/CustomerFormScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import SalesScreen from '../screens/SalesScreen';
import SaleFormScreen from '../screens/SaleFormScreen';
import SaleDetailScreen from '../screens/SaleDetailScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import EmployeeFormScreen from '../screens/EmployeeFormScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceFormScreen from '../screens/AttendanceFormScreen';
import PayrollScreen from '../screens/PayrollScreen';
import PayrollFormScreen from '../screens/PayrollFormScreen';
import LedgerScreen from '../screens/LedgerScreen';
import LedgerFormScreen from '../screens/LedgerFormScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import LoansScreen from '../screens/LoansScreen';
import LoanFormScreen from '../screens/LoanFormScreen';
import ReportsScreen from '../screens/ReportsScreen';
import UsersScreen from '../screens/UsersScreen';
import UserFormScreen from '../screens/UserFormScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Stack navigators for each module
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    </Stack.Navigator>
  );
}

function VehiclesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VehiclesList" component={VehiclesScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}

function CustomersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomersList" component={CustomersScreen} />
      <Stack.Screen name="CustomerForm" component={CustomerFormScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
    </Stack.Navigator>
  );
}

function SalesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SalesList" component={SalesScreen} />
      <Stack.Screen name="SaleForm" component={SaleFormScreen} />
      <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
    </Stack.Navigator>
  );
}

function EmployeesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EmployeesList" component={EmployeesScreen} />
      <Stack.Screen name="EmployeeForm" component={EmployeeFormScreen} />
    </Stack.Navigator>
  );
}

function AttendanceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AttendanceList" component={AttendanceScreen} />
      <Stack.Screen name="AttendanceForm" component={AttendanceFormScreen} />
    </Stack.Navigator>
  );
}

function PayrollStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PayrollList" component={PayrollScreen} />
      <Stack.Screen name="PayrollForm" component={PayrollFormScreen} />
    </Stack.Navigator>
  );
}

function LedgerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LedgerList" component={LedgerScreen} />
      <Stack.Screen name="LedgerForm" component={LedgerFormScreen} />
    </Stack.Navigator>
  );
}

function CurrencyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CurrencyHome" component={CurrencyScreen} />
    </Stack.Navigator>
  );
}

function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoansList" component={LoansScreen} />
      <Stack.Screen name="LoanForm" component={LoanFormScreen} />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReportsHome" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsersList" component={UsersScreen} />
      <Stack.Screen name="UserForm" component={UserFormScreen} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const NAV_ITEMS = [
  { name: 'Dashboard', component: DashboardStack, icon: 'view-dashboard', access: 'Dashboard' },
  { name: 'Vehicles', component: VehiclesStack, icon: 'car', access: 'Vehicles' },
  { name: 'Customers', component: CustomersStack, icon: 'account-group', access: 'Customers' },
  { name: 'Sales', component: SalesStack, icon: 'cart', access: 'Sales' },
  { name: 'Employees', component: EmployeesStack, icon: 'account-tie', access: 'Employees' },
  { name: 'Attendance', component: AttendanceStack, icon: 'calendar-check', access: 'Attendance' },
  { name: 'Payroll', component: PayrollStack, icon: 'cash-multiple', access: 'Payroll' },
  { name: 'ShowroomLedger', component: LedgerStack, icon: 'book-open-variant', access: 'Showroom Ledger' },
  { name: 'Currency', component: CurrencyStack, icon: 'currency-usd', access: 'Currency Exchange' },
  { name: 'Loans', component: LoansStack, icon: 'bank-transfer', access: 'Loans & Debts' },
  { name: 'Reports', component: ReportsStack, icon: 'chart-bar', access: 'Reports' },
  { name: 'Users', component: UsersStack, icon: 'shield-account', access: 'Users & Roles' },
  { name: 'Settings', component: SettingsStack, icon: 'cog', access: null },
];

export default function AppDrawer() {
  const { paperTheme } = useAppTheme();
  const { user } = useAuth();

  const role = user?.role || 'Viewer';
  const allowed = ROLE_ACCESS[role] || ROLE_ACCESS['Viewer'];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: paperTheme.colors.surface, width: 300 },
        drawerActiveTintColor: paperTheme.colors.primary,
        drawerInactiveTintColor: paperTheme.colors.onSurfaceVariant,
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      {NAV_ITEMS.filter(item => item.access === null || allowed.includes(item.access)).map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{ drawerIcon: ({ color, size }) => <Icon name={item.icon} color={color} size={size} />, title: item.name === 'ShowroomLedger' ? 'Showroom Ledger' : item.name }}
        />
      ))}
    </Drawer.Navigator>
  );
}


