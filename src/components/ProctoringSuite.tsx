import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Shield, 
  Users, 
  Smartphone, 
  BookOpen,
  Monitor
} from 'lucide-react';

interface ProctoringEvent {
  id: string;
  type: 'focus_lost' | 'no_face' | 'multiple_faces' | 'prohibited_item' | 'tab_switch';
  timestamp: Date;
  duration?: number;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface ProctoringSuiteProps {
  isEnabled: boolean;
  onToggle: () => void;
  candidateId?: string;
}

export const ProctoringSuite = ({ isEnabled, onToggle, candidateId }: ProctoringSuiteProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'normal' | 'warning' | 'violation'>('normal');
  const [faceDetected, setFaceDetected] = useState(true);
  const [focusDetected, setFocusDetected] = useState(true);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate face detection and monitoring
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      // Simulate various monitoring scenarios
      const random = Math.random();
      
      // Simulate focus detection
      if (random < 0.02) { // 2% chance of focus loss
        addEvent({
          type: 'focus_lost',
          description: 'Candidate looked away from screen',
          severity: 'medium'
        });
        setFocusDetected(false);
        setTimeout(() => setFocusDetected(true), 3000);
      }

      // Simulate face detection
      if (random < 0.01) { // 1% chance of no face
        addEvent({
          type: 'no_face',
          description: 'No face detected in video feed',
          severity: 'high'
        });
        setFaceDetected(false);
        setTimeout(() => setFaceDetected(true), 2000);
      }

      // Simulate multiple faces
      if (random < 0.005) { // 0.5% chance of multiple faces
        addEvent({
          type: 'multiple_faces',
          description: 'Multiple faces detected in frame',
          severity: 'high'
        });
      }

      // Simulate prohibited items
      if (random < 0.008) { // 0.8% chance of item detection
        const items = ['Mobile phone', 'Book/notes', 'Second monitor'];
        const item = items[Math.floor(Math.random() * items.length)];
        addEvent({
          type: 'prohibited_item',
          description: `Prohibited item detected: ${item}`,
          severity: 'high'
        });
      }

      // Update analysis status
      setIsAnalyzing(Math.random() < 0.3);
    }, 2000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  // Monitor tab visibility
  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent({
          type: 'tab_switch',
          description: 'Tab switched or window minimized',
          severity: 'high'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isEnabled]);

  const addEvent = (eventData: Omit<ProctoringEvent, 'id' | 'timestamp'>) => {
    const event: ProctoringEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      timestamp: new Date()
    };

    setEvents(prev => [...prev, event]);
    
    // Update integrity score
    const deduction = eventData.severity === 'high' ? 10 : eventData.severity === 'medium' ? 5 : 2;
    setIntegrityScore(prev => Math.max(0, prev - deduction));
    
    // Update status
    if (eventData.severity === 'high') {
      setCurrentStatus('violation');
      setTimeout(() => setCurrentStatus('normal'), 5000);
    } else if (eventData.severity === 'medium') {
      setCurrentStatus('warning');
      setTimeout(() => setCurrentStatus('normal'), 3000);
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'violation': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'violation': return 'Security Violation Detected';
      case 'warning': return 'Monitoring Alert';
      default: return 'All Systems Normal';
    }
  };

  const getEventIcon = (type: ProctoringEvent['type']) => {
    switch (type) {
      case 'focus_lost': return <EyeOff className="h-4 w-4" />;
      case 'no_face': return <Eye className="h-4 w-4" />;
      case 'multiple_faces': return <Users className="h-4 w-4" />;
      case 'prohibited_item': return <Smartphone className="h-4 w-4" />;
      case 'tab_switch': return <Monitor className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const recentEvents = events.slice(-5).reverse();

  return (
    <div className="space-y-4">
      {/* Proctoring Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Interview Proctoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isEnabled ? 'default' : 'outline'}>
                {isEnabled ? 'Active' : 'Disabled'}
              </Badge>
              <Button variant="outline" size="sm" onClick={onToggle}>
                {isEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isEnabled && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Video Feed */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Live Video Feed</h4>
                <div className="relative">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    width={300}
                    height={200}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg border"
                  />
                  {isAnalyzing && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        Analyzing...
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Badge variant={faceDetected ? 'default' : 'destructive'} className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      {faceDetected ? 'Face OK' : 'No Face'}
                    </Badge>
                    <Badge variant={focusDetected ? 'default' : 'destructive'} className="text-xs">
                      <Camera className="h-3 w-3 mr-1" />
                      {focusDetected ? 'Focused' : 'Distracted'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Status Panel */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Security Status</h4>
                  <div className={`text-lg font-bold ${getStatusColor()}`}>
                    {getStatusText()}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Integrity Score</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          integrityScore >= 80 ? 'bg-success' :
                          integrityScore >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${integrityScore}%` }}
                      />
                    </div>
                    <span className="font-bold text-lg">
                      {integrityScore}/100
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Detection Summary</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Total Events: {events.length}</div>
                    <div>High Severity: {events.filter(e => e.severity === 'high').length}</div>
                    <div>Session Duration: {Math.floor(Date.now() / 60000)} min</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Events */}
      {isEnabled && recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <Alert key={event.id} className={`${
                  event.severity === 'high' ? 'border-destructive' :
                  event.severity === 'medium' ? 'border-warning' : 'border-muted'
                }`}>
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <AlertDescription className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{event.description}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            event.severity === 'high' ? 'destructive' :
                            event.severity === 'medium' ? 'outline' : 'secondary'
                          } className="text-xs">
                            {event.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proctoring Report Preview */}
      {!isEnabled && events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proctoring Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{integrityScore}</div>
                <div className="text-sm text-muted-foreground">Integrity Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {events.filter(e => e.severity === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">Violations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {events.filter(e => e.severity === 'medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};