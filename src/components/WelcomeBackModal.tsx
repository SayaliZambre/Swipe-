import { useInterviewStore } from '@/store/interview-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlayCircle, Pause } from 'lucide-react';

export const WelcomeBackModal = () => {
  const { showWelcomeBack, setShowWelcomeBack, resumeInterview, currentCandidateId, candidates } = useInterviewStore();
  
  const candidate = candidates.find(c => c.id === currentCandidateId);
  
  if (!candidate || !showWelcomeBack) return null;

  const handleResume = () => {
    resumeInterview();
  };

  const handleStartFresh = () => {
    setShowWelcomeBack(false);
    // Could implement starting fresh logic here
  };

  return (
    <Dialog open={showWelcomeBack} onOpenChange={setShowWelcomeBack}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            Welcome Back!
          </DialogTitle>
          <DialogDescription>
            You have an unfinished interview session. Would you like to continue where you left off?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Current Progress:</p>
            <p className="text-sm text-muted-foreground mt-1">
              Question {candidate.currentQuestionIndex + 1} of {candidate.questions.length}
            </p>
            <div className="w-full bg-background rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((candidate.currentQuestionIndex) / candidate.questions.length) * 100}%` 
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleResume} className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              Resume Interview
            </Button>
            <Button onClick={handleStartFresh} variant="outline" className="w-full">
              <Pause className="mr-2 h-4 w-4" />
              Start Fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};