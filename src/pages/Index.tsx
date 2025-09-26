import { useEffect } from 'react';
import { useInterviewStore } from '@/store/interview-store';
import { TabNavigation } from '@/components/TabNavigation';
import { IntervieweeTab } from '@/components/IntervieweeTab';
import { InterviewerTab } from '@/components/InterviewerTab';
import { WelcomeBackModal } from '@/components/WelcomeBackModal';

const Index = () => {
  const { activeTab, candidates, setShowWelcomeBack } = useInterviewStore();

  // Check for unfinished sessions on app load
  useEffect(() => {
    const unfinishedCandidate = candidates.find(
      c => c.status === 'in-progress' || c.status === 'paused'
    );
    
    if (unfinishedCandidate) {
      setShowWelcomeBack(true);
    }
  }, [candidates, setShowWelcomeBack]);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Crisp
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Interview Assistant
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Full Stack Developer Interview</p>
              <p className="text-xs text-muted-foreground">6 Questions • Timed Assessment</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto">
        <TabNavigation />
        
        <div className="p-4">
          {activeTab === 'interviewee' ? (
            <IntervieweeTab />
          ) : (
            <InterviewerTab />
          )}
        </div>
      </div>

      <WelcomeBackModal />
    </main>
  );
};

export default Index;
