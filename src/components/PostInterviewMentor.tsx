import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  Code, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Target,
  Award,
  Lightbulb
} from 'lucide-react';
import { useInterviewStore } from '@/store/interview-store';

interface LearningResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'practice' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  description: string;
  estimatedTime: string;
  rating: number;
}

interface SkillAssessment {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
  resources: LearningResource[];
}

interface PostInterviewMentorProps {
  candidateId: string;
}

export const PostInterviewMentor = ({ candidateId }: PostInterviewMentorProps) => {
  const { candidates } = useInterviewStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  const candidate = candidates.find(c => c.id === candidateId);
  
  if (!candidate || candidate.status !== 'completed') {
    return null;
  }

  // Analyze candidate performance and generate recommendations
  const skillAssessments: SkillAssessment[] = [
    {
      skill: 'JavaScript Fundamentals',
      currentLevel: 6,
      targetLevel: 9,
      priority: 'high',
      resources: [
        {
          id: '1',
          title: 'JavaScript: The Good Parts',
          type: 'book',
          difficulty: 'intermediate',
          url: '#',
          description: 'Deep dive into JavaScript best practices and advanced concepts',
          estimatedTime: '12 hours',
          rating: 4.5
        },
        {
          id: '2',
          title: 'Modern JavaScript ES6+ Features',
          type: 'video',
          difficulty: 'intermediate',
          url: '#',
          description: 'Comprehensive guide to modern JavaScript features',
          estimatedTime: '3 hours',
          rating: 4.7
        }
      ]
    },
    {
      skill: 'React Development',
      currentLevel: 7,
      targetLevel: 9,
      priority: 'high',
      resources: [
        {
          id: '3',
          title: 'React Hooks Mastery',
          type: 'course',
          difficulty: 'advanced',
          url: '#',
          description: 'Master React Hooks and modern patterns',
          estimatedTime: '8 hours',
          rating: 4.8
        },
        {
          id: '4',
          title: 'React Performance Optimization',
          type: 'article',
          difficulty: 'advanced',
          url: '#',
          description: 'Learn advanced React optimization techniques',
          estimatedTime: '2 hours',
          rating: 4.6
        }
      ]
    },
    {
      skill: 'System Design',
      currentLevel: 4,
      targetLevel: 8,
      priority: 'medium',
      resources: [
        {
          id: '5',
          title: 'System Design Interview Prep',
          type: 'course',
          difficulty: 'intermediate',
          url: '#',
          description: 'Complete system design interview preparation',
          estimatedTime: '15 hours',
          rating: 4.9
        },
        {
          id: '6',
          title: 'Designing Data-Intensive Applications',
          type: 'book',
          difficulty: 'advanced',
          url: '#',
          description: 'The definitive guide to distributed systems',
          estimatedTime: '40 hours',
          rating: 4.7
        }
      ]
    },
    {
      skill: 'Problem Solving',
      currentLevel: 8,
      targetLevel: 9,
      priority: 'low',
      resources: [
        {
          id: '7',
          title: 'LeetCode Daily Practice',
          type: 'practice',
          difficulty: 'intermediate',
          url: '#',
          description: 'Daily coding problems to improve algorithmic thinking',
          estimatedTime: '1 hour/day',
          rating: 4.4
        }
      ]
    }
  ];

  const getResourceIcon = (type: LearningResource['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'course': return <GraduationCap className="h-4 w-4" />;
      case 'book': return <BookOpen className="h-4 w-4" />;
      case 'practice': return <Code className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: SkillAssessment['priority']) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
    }
  };

  const overallProgress = Math.round(
    skillAssessments.reduce((sum, skill) => sum + (skill.currentLevel / skill.targetLevel * 100), 0) / skillAssessments.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Your Learning Journey
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Personalized recommendations based on your interview performance
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Your Development Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-success">{skillAssessments.filter(s => s.priority === 'low').length}</div>
                <div className="text-xs text-muted-foreground">Strong Areas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-warning">{skillAssessments.filter(s => s.priority === 'medium').length}</div>
                <div className="text-xs text-muted-foreground">Improving</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">{skillAssessments.filter(s => s.priority === 'high').length}</div>
                <div className="text-xs text-muted-foreground">Focus Areas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill Assessment & Resources */}
      <Tabs defaultValue="skills" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skill Assessment</TabsTrigger>
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="resources">All Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          {skillAssessments.map((skill) => (
            <Card key={skill.skill}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{skill.skill}</h3>
                    <Badge variant={skill.priority === 'high' ? 'destructive' : skill.priority === 'medium' ? 'outline' : 'secondary'}>
                      {skill.priority} priority
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {skill.currentLevel}/{skill.targetLevel}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Level</span>
                    <span>Target Level</span>
                  </div>
                  <div className="relative">
                    <Progress value={(skill.currentLevel / skill.targetLevel) * 100} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 bg-primary/30 rounded-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">
                    {skill.resources.length} resources available
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedSkill(selectedSkill === skill.skill ? null : skill.skill)}
                  >
                    {selectedSkill === skill.skill ? 'Hide Resources' : 'View Resources'}
                  </Button>
                </div>
                
                {selectedSkill === skill.skill && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    {skill.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-3">
                          {getResourceIcon(resource.type)}
                          <div>
                            <h4 className="text-sm font-medium">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.estimatedTime}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="learning-path" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Based on your interview performance, here's your personalized 12-week learning plan:
                </div>
                
                {['Week 1-3: JavaScript Fundamentals', 'Week 4-6: React Advanced Patterns', 'Week 7-9: System Design Basics', 'Week 10-12: Interview Practice'].map((phase, index) => (
                  <div key={phase} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{phase}</h4>
                      <p className="text-sm text-muted-foreground">
                        Focus on building strong fundamentals and practical skills
                      </p>
                    </div>
                    <Badge variant="outline">3 weeks</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillAssessments.flatMap(skill => skill.resources).map((resource) => (
              <Card key={resource.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <h4 className="font-medium">{resource.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs">{resource.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {resource.estimatedTime}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Access Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};