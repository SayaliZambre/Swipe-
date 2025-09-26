import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Send, Moon, Sun, Globe, MessageSquare, X } from 'lucide-react';
import { useInterviewStore } from '@/store/interview-store';

interface AIChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AIChatbot = ({ isOpen, onToggle }: AIChatbotProps) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentCandidateId, candidates } = useInterviewStore();
  const candidate = candidates.find(c => c.id === currentCandidateId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user' as const,
      content: message
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai-${Date.now()}`,
        type: 'ai' as const,
        content: getAIResponse(message, language, candidate)
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (userMessage: string, lang: string, candidate: any) => {
    const responses = {
      en: {
        greeting: "Hello! I'm your AI interview assistant. How can I help you today?",
        nervous: "It's completely normal to feel nervous! Take deep breaths and remember that this is a conversation, not an interrogation. You've got this!",
        technical: "For technical questions, break down your thought process step by step. It's okay to think out loud!",
        time: "Don't worry about the timer too much. Focus on giving clear, concise answers. Quality over speed!",
        default: "I'm here to support you throughout this interview. Feel free to ask me anything!"
      },
      hi: {
        greeting: "नमस्ते! मैं आपका AI इंटरव्यू असिस्टेंट हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        nervous: "घबराना बिल्कुल सामान्य है! गहरी सांस लें और याद रखें कि यह एक बातचीत है, पूछताछ नहीं।",
        technical: "तकनीकी प्रश्नों के लिए, अपनी सोच को कदम दर कदम बताएं। जोर से सोचना ठीक है!",
        time: "टाइमर की ज्यादा चिंता न करें। स्पष्ट, संक्षिप्त उत्तर देने पर ध्यान दें।",
        default: "मैं इस इंटरव्यू के दौरान आपका साथ देने के लिए यहां हूं। कुछ भी पूछ सकते हैं!"
      }
    };

    const langResponses = responses[lang as keyof typeof responses] || responses.en;
    
    if (userMessage.toLowerCase().includes('nervous') || userMessage.toLowerCase().includes('scared')) {
      return langResponses.nervous;
    }
    if (userMessage.toLowerCase().includes('technical') || userMessage.toLowerCase().includes('code')) {
      return langResponses.technical;
    }
    if (userMessage.toLowerCase().includes('time') || userMessage.toLowerCase().includes('timer')) {
      return langResponses.time;
    }
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      return langResponses.greeting;
    }
    
    return langResponses.default;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-16 h-8">
                <Globe className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="hi">हि</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              {language === 'hi' 
                ? 'मुझसे कुछ भी पूछें! मैं यहां मदद के लिए हूं।'
                : 'Ask me anything! I\'m here to help.'}
            </div>
          )}
          
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2 text-sm ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-2 text-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={language === 'hi' ? 'मुझसे कुछ पूछें...' : 'Ask me something...'}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};