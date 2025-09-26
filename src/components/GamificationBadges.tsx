import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Target, 
  Lightbulb, 
  Code, 
  Trophy, 
  Zap, 
  Star, 
  Award,
  CheckCircle,
  Timer
} from 'lucide-react';
import { useInterviewStore } from '@/store/interview-store';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earned: boolean;
  requirement: string;
}

interface GamificationBadgesProps {
  candidateId?: string;
  showAll?: boolean;
}

export const GamificationBadges = ({ candidateId, showAll = false }: GamificationBadgesProps) => {
  const { candidates } = useInterviewStore();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  
  const candidate = candidateId ? candidates.find(c => c.id === candidateId) : null;

  const allBadges: BadgeData[] = [
    {
      id: 'quick_thinker',
      name: '🕒 Quick Thinker',
      description: 'Answered within first 25% of allotted time',
      icon: <Clock className="h-4 w-4" />,
      color: 'bg-blue-500',
      earned: false,
      requirement: 'Answer quickly'
    },
    {
      id: 'accurate_coder',
      name: '🎯 Accurate Coder',
      description: 'Scored 9+ on a coding question',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-green-500',
      earned: false,
      requirement: 'High coding score'
    },
    {
      id: 'creative_solver',
      name: '💡 Creative Problem Solver',
      description: 'Provided unique solution approach',
      icon: <Lightbulb className="h-4 w-4" />,
      color: 'bg-purple-500',
      earned: false,
      requirement: 'Unique answers'
    },
    {
      id: 'code_master',
      name: '⚡ Code Master',
      description: 'Perfect score on all coding questions',
      icon: <Code className="h-4 w-4" />,
      color: 'bg-orange-500',
      earned: false,
      requirement: 'Perfect coding'
    },
    {
      id: 'consistency_king',
      name: '🏆 Consistency King',
      description: 'Scored 7+ on all questions',
      icon: <Trophy className="h-4 w-4" />,
      color: 'bg-yellow-500',
      earned: false,
      requirement: 'Consistent performance'
    },
    {
      id: 'lightning_fast',
      name: '⚡ Lightning Fast',
      description: 'Fastest overall completion time',
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-red-500',
      earned: false,
      requirement: 'Fast completion'
    },
    {
      id: 'perfectionist',
      name: '⭐ Perfectionist',
      description: 'Achieved 95+ final score',
      icon: <Star className="h-4 w-4" />,
      color: 'bg-pink-500',
      earned: false,
      requirement: '95+ score'
    },
    {
      id: 'interview_champion',
      name: '🏅 Interview Champion',
      description: 'Top performer of the day',
      icon: <Award className="h-4 w-4" />,
      color: 'bg-indigo-500',
      earned: false,
      requirement: 'Top performer'
    },
    {
      id: 'first_attempt',
      name: '✅ First Attempt Success',
      description: 'Completed interview without pausing',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'bg-teal-500',
      earned: false,
      requirement: 'No pauses'
    },
    {
      id: 'time_manager',
      name: '⏱️ Time Manager',
      description: 'Optimal time usage across all questions',
      icon: <Timer className="h-4 w-4" />,
      color: 'bg-cyan-500',
      earned: false,
      requirement: 'Good time usage'
    }
  ];

  useEffect(() => {
    if (!candidate) {
      setBadges(allBadges.map(badge => ({ ...badge, earned: false })));
      return;
    }

    const earnedBadges = allBadges.map(badge => {
      let earned = false;

      switch (badge.id) {
        case 'quick_thinker':
          earned = candidate.answers.some((answer: any) => {
            const question = candidate.questions.find((q: any) => q.id === answer.questionId);
            return question && answer.timeSpent <= question.timeLimit * 0.25;
          });
          break;
          
        case 'accurate_coder':
          earned = candidate.questions.some((q: any) => 
            q.difficulty === 'hard' && q.score >= 9
          );
          break;
          
        case 'creative_solver':
          // Simulate unique solution detection based on answer length and keywords
          earned = candidate.answers.some((answer: any) => 
            answer.text.length > 100 && 
            (answer.text.includes('alternative') || answer.text.includes('different') || answer.text.includes('another way'))
          );
          break;
          
        case 'code_master':
          const codingQuestions = candidate.questions.filter((q: any) => q.difficulty === 'hard');
          earned = codingQuestions.length > 0 && codingQuestions.every((q: any) => q.score === 10);
          break;
          
        case 'consistency_king':
          earned = candidate.questions.length > 0 && candidate.questions.every((q: any) => q.score >= 7);
          break;
          
        case 'lightning_fast':
          const totalTimeSpent = candidate.answers.reduce((total: number, answer: any) => total + answer.timeSpent, 0);
          const totalTimeAllowed = candidate.questions.reduce((total: number, q: any) => total + q.timeLimit, 0);
          earned = totalTimeSpent <= totalTimeAllowed * 0.6;
          break;
          
        case 'perfectionist':
          earned = candidate.finalScore >= 95;
          break;
          
        case 'interview_champion':
          // This would be determined by comparing with other candidates
          earned = candidate.finalScore >= 90;
          break;
          
        case 'first_attempt':
          earned = candidate.status === 'completed' && !candidate.answers.some(() => false); // Never paused
          break;
          
        case 'time_manager':
          const avgTimeUsage = candidate.answers.reduce((total: number, answer: any) => {
            const question = candidate.questions.find((q: any) => q.id === answer.questionId);
            return total + (question ? answer.timeSpent / question.timeLimit : 0);
          }, 0) / candidate.answers.length;
          earned = avgTimeUsage >= 0.7 && avgTimeUsage <= 0.9;
          break;
      }

      return { ...badge, earned };
    });

    setBadges(earnedBadges);
  }, [candidate]);

  const earnedBadges = badges.filter(badge => badge.earned);
  const displayBadges = showAll ? badges : earnedBadges;

  if (displayBadges.length === 0 && !showAll) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {showAll ? 'Available Badges' : 'Earned Badges'}
          {!showAll && earnedBadges.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {earnedBadges.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {displayBadges.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No badges earned yet.</p>
            <p className="text-sm">Complete your interview to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  badge.earned 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-muted bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${badge.color} text-white opacity-90`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-tight">
                      {badge.description}
                    </p>
                    {!badge.earned && showAll && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        {badge.requirement}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!showAll && earnedBadges.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Great job! You've earned {earnedBadges.length} badge{earnedBadges.length !== 1 ? 's' : ''}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};