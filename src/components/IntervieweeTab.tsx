import { useState, useRef, useEffect } from 'react';
import { useInterviewStore } from '@/store/interview-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Send, Clock, User, Mail, Phone, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { AIChatbot } from '@/components/AIChatbot';
import { CodeEditor } from '@/components/CodeEditor';
import { Whiteboard } from '@/components/Whiteboard';
import { ProctoringSuite } from '@/components/ProctoringSuite';
import { GamificationBadges } from '@/components/GamificationBadges';

export const IntervieweeTab = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <div className="flex gap-4 h-[calc(100vh-4rem)]">
      <Card className="flex-1 flex flex-col">
        <InterviewFlow />
      </Card>
      <AIChatbot 
        isOpen={showChatbot} 
        onToggle={() => setShowChatbot(!showChatbot)} 
      />
    </div>
  );
};

const InterviewFlow = () => {
  const { 
    currentCandidateId, 
    candidates, 
    chatMessages,
    isInterviewActive,
    currentTimer,
    addChatMessage,
    createCandidate,
    updateCandidate,
    startInterview,
    submitAnswer
  } = useInterviewStore();
  
  const candidate = candidates.find(c => c.id === currentCandidateId);
  
  if (!currentCandidateId || !candidate) {
    return <ResumeUpload />;
  }
  
  if (candidate.status === 'collecting-info') {
    return <InfoCollection candidate={candidate} />;
  }
  
  if (candidate.status === 'not-started') {
    return <InterviewStart candidate={candidate} />;
  }
  
  return <ChatInterface candidate={candidate} />;
};

const ResumeUpload = () => {
  const { createCandidate } = useInterviewStore();
  const { toast } = useToast();
  
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const candidateId = createCandidate(text);
      toast({
        title: "Resume uploaded successfully!",
        description: "Please provide any missing information to continue.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process the resume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Upload Your Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p>Drop your resume here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports PDF and DOCX files
                </p>
                <Button variant="outline">
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InfoCollection = ({ candidate }: { candidate: any }) => {
  const [name, setName] = useState(candidate.name || '');
  const [email, setEmail] = useState(candidate.email || '');
  const [phone, setPhone] = useState(candidate.phone || '');
  const { updateCandidate } = useInterviewStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCandidate(candidate.id, {
      name,
      email, 
      phone,
      status: 'not-started'
    });
  };
  
  const isComplete = name.trim() && email.trim() && phone.trim();
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!isComplete}>
              Continue to Interview
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const InterviewStart = ({ candidate }: { candidate: any }) => {
  const { startInterview } = useInterviewStore();
  
  const handleStart = () => {
    startInterview(candidate.id);
  };
  
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Welcome, <span className="font-medium text-foreground">{candidate.name}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              You're about to start a Full Stack Developer interview with 6 questions.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Interview Structure:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 2 Easy questions (20 seconds each)</p>
              <p>• 2 Medium questions (60 seconds each)</p>
              <p>• 2 Hard questions (120 seconds each)</p>
            </div>
          </div>
          
          <Button onClick={handleStart} size="lg" className="w-full">
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const ChatInterface = ({ candidate }: { candidate: any }) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showProctoring, setShowProctoring] = useState(false);
  const { 
    chatMessages, 
    isInterviewActive,
    currentTimer,
    submitAnswer,
    pauseInterview 
  } = useInterviewStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;
    
    submitAnswer(currentAnswer);
    setCurrentAnswer('');
  };
  
  const currentQuestion = candidate.questions[candidate.currentQuestionIndex];
  const progress = ((candidate.currentQuestionIndex) / candidate.questions.length) * 100;
  
  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Interview in Progress</CardTitle>
          <div className="flex items-center gap-4">
            {isInterviewActive && currentTimer > 0 && (
              <div className={`flex items-center gap-2 ${currentTimer <= 10 ? 'timer-warning text-warning' : ''}`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">
                  {Math.floor(currentTimer / 60)}:{(currentTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {isInterviewActive && (
              <Button variant="outline" size="sm" onClick={pauseInterview}>
                Pause
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {candidate.currentQuestionIndex + 1} of {candidate.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-chat-bubble-user text-chat-bubble-user-foreground'
                    : message.type === 'system'
                    ? 'bg-success text-success-foreground'
                    : 'bg-chat-bubble-ai text-chat-bubble-ai-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {isInterviewActive && candidate.status !== 'completed' && (
          <div className="border-t p-4 space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowCodeEditor(!showCodeEditor)}>
                Code Editor
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowWhiteboard(!showWhiteboard)}>
                Whiteboard
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowProctoring(!showProctoring)}>
                Proctoring
              </Button>
            </div>
            
            {showCodeEditor && <CodeEditor isVisible={showCodeEditor} onCodeSubmit={(code) => setCurrentAnswer(code)} />}
            {showWhiteboard && <Whiteboard isVisible={showWhiteboard} />}
            {showProctoring && <ProctoringSuite isEnabled={showProctoring} onToggle={() => setShowProctoring(!showProctoring)} />}
            
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" disabled={!currentAnswer.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
        
        {candidate.status === 'completed' && (
          <div className="p-4 border-t">
            <GamificationBadges candidateId={candidate.id} />
          </div>
        )}
      </CardContent>
    </>
  );
};