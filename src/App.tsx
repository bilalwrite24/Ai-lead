/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { QualificationWizard } from './components/qualification/QualificationWizard';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardOverview />;
    case 'qualification':
      return <QualificationWizard />;
    case 'history':
      return <HistoryView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardOverview />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
}
