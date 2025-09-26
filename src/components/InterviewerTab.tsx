import { useState } from 'react';
import { useInterviewStore } from '@/store/interview-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, SortAsc, SortDesc, User, Calendar, Trophy, MessageSquare } from 'lucide-react';

export const InterviewerTab = () => {
  const { 
    candidates, 
    searchQuery, 
    setSearchQuery, 
    sortBy, 
    setSortBy 
  } = useInterviewStore();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  
  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
  
  const getStatusBadge = (status: string) => {
    const variants = {
      'completed': 'default',
      'in-progress': 'secondary',
      'paused': 'outline',
      'collecting-info': 'secondary',
      'not-started': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };
  
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };
  
  return (
    <Card className="h-[calc(100vh-4rem)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Candidate Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={sortBy === 'score' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('score')}
                className="rounded-r-none"
              >
                Score
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('name')}
                className="rounded-none border-x"
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('date')}
                className="rounded-l-none"
              >
                Date
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{candidates.length}</div>
              <p className="text-xs text-muted-foreground">Total Candidates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {candidates.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">
                {candidates.filter(c => c.status === 'in-progress').length}
              </div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {candidates.filter(c => c.finalScore).length > 0 
                  ? Math.round(candidates.filter(c => c.finalScore).reduce((sum, c) => sum + (c.finalScore || 0), 0) / candidates.filter(c => c.finalScore).length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        {filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'Candidates will appear here after they start interviews'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(candidate.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${candidate.questions.length > 0 ? (candidate.currentQuestionIndex / candidate.questions.length) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {candidate.currentQuestionIndex}/{candidate.questions.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${getScoreColor(candidate.finalScore)}`}>
                      {candidate.finalScore ? `${candidate.finalScore}/100` : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(candidate.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <CandidateDetail candidate={candidate} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const CandidateDetail = ({ candidate }: { candidate: any }) => {
  const { chatMessages } = useInterviewStore();
  
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          {candidate.name || 'Candidate Details'}
        </DialogTitle>
        <DialogDescription>
          Interview started on {new Date(candidate.createdAt).toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Candidate Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Candidate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{candidate.name || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm">{candidate.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm">{candidate.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant={candidate.status === 'completed' ? 'default' : 'secondary'}>
                    {candidate.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Final Score & Summary */}
        {candidate.finalScore && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {candidate.finalScore}/100
                </div>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all duration-300"
                      style={{ width: `${candidate.finalScore}%` }}
                    />
                  </div>
                </div>
              </div>
              {candidate.summary && (
                <p className="text-sm text-muted-foreground">{candidate.summary}</p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Questions & Answers */}
        {candidate.questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions & Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.questions.map((question: any, index: number) => {
                const answer = candidate.answers.find((a: any) => a.questionId === question.id);
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question {index + 1} - {question.difficulty}
                      </Badge>
                      {question.score && (
                        <Badge variant="default">
                          Score: {question.score}/10
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-sm">Question:</p>
                        <p className="text-sm text-muted-foreground">{question.text}</p>
                      </div>
                      {answer && (
                        <div>
                          <p className="font-medium text-sm">Answer:</p>
                          <p className="text-sm text-muted-foreground">
                            {answer.text || 'No answer provided (time expired)'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Time spent: {answer.timeSpent}s / {question.timeLimit}s
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
        
        {/* Chat History */}
        {chatMessages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 text-sm ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'system'
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);