import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ApiKeyModal from './components/ApiKeyModal';
import HomeView from './views/HomeView';
import ArticleDetailView from './views/ArticleDetailView';
import EditorView from './views/EditorView';
import AnalyticsView from './views/AnalyticsView';
import MonetizationView from './views/MonetizationView';
import SsrInspectView from './views/SsrInspectView';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSelectPost = (slug) => {
    setSelectedSlug(slug);
    setActiveView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublished = (newSlug) => {
    if (newSlug) {
      setSelectedSlug(newSlug);
      setActiveView('article');
    } else {
      setActiveView('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      
      {/* Top Navbar with Reader Tier Simulator */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeView
            onSelectPost={handleSelectPost}
            onNewPost={() => setActiveView('editor')}
            setActiveView={setActiveView}
          />
        )}

        {activeView === 'article' && (
          <ArticleDetailView
            slug={selectedSlug}
            onBack={() => setActiveView('home')}
            onOpenSubscribeModal={() => setActiveView('monetization')}
          />
        )}

        {activeView === 'editor' && (
          <EditorView
            onPublished={handlePublished}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {activeView === 'analytics' && (
          <AnalyticsView
            onSelectPost={handleSelectPost}
          />
        )}

        {activeView === 'monetization' && (
          <MonetizationView />
        )}

        {activeView === 'ssr' && (
          <SsrInspectView />
        )}
      </main>

      {/* Footer */}
      <Footer setActiveView={setActiveView} />

      {/* OpenAI API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

    </div>
  );
}
