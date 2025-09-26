import { useInterviewStore } from '@/store/interview-store';
import { Button } from '@/components/ui/button';
import { MessageSquare, BarChart3 } from 'lucide-react';

export const TabNavigation = () => {
  const { activeTab, setActiveTab } = useInterviewStore();

  return (
    <div className="flex bg-card border-b border-border">
      <Button
        variant={activeTab === 'interviewee' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('interviewee')}
        className="flex-1 rounded-none border-r border-border h-14 text-base font-medium"
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Interviewee
      </Button>
      <Button
        variant={activeTab === 'interviewer' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('interviewer')}
        className="flex-1 rounded-none h-14 text-base font-medium"
      >
        <BarChart3 className="mr-2 h-5 w-5" />
        Interviewer Dashboard
      </Button>
    </div>
  );
};