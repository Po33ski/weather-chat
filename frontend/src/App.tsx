import React from 'react';
import { Layout } from './app/components/Layout/Layout';
import { ChatPage } from './app/views/ChatPage';

const App: React.FC = () => {
  return (
    <Layout>
      <ChatPage />
    </Layout>
  );
};

export default App;

