import dynamic from 'next/dynamic';

// Dynamically import ChatPage with no SSR to prevent Firebase initialization during build
const ChatPage = dynamic(() => import('@/app/views/ChatPage').then(mod => ({ default: mod.ChatPage })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Loading chat...</div>
});

export default function Home() {
  return <ChatPage />;
}
