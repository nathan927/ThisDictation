import React from 'react';
import Layout from './components/Layout';
import ContentInput from './components/ContentInput';
import DictationSettings from './components/DictationSettings';
import DictationPlayer from './components/DictationPlayer';
import { DictationProvider } from './context/DictationContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <DictationProvider>
        <Layout>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ContentInput />
            <DictationSettings />
          </div>
          <DictationPlayer />
        </Layout>
      </DictationProvider>
    </AuthProvider>
  );
}

export default App;