import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'not-started' | 'collecting-info' | 'in-progress' | 'completed' | 'paused';

export interface Question {
  id: string;
  text: string;
  difficulty: QuestionDifficulty;
  timeLimit: number; // in seconds
  score?: number; // 0-10
  feedback?: string;
}

export interface Answer {
  questionId: string;
  text: string;
  timeSpent: number;
  timestamp: Date;
}

export interface Candidate {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  resumeText?: string;
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  finalScore?: number;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface InterviewStore {
  // Current session state
  currentCandidateId: string | null;
  activeTab: 'interviewee' | 'interviewer';
  showWelcomeBack: boolean;
  
  // All candidates
  candidates: Candidate[];
  
  // Current interview state
  chatMessages: ChatMessage[];
  isInterviewActive: boolean;
  currentTimer: number;
  timerInterval: NodeJS.Timeout | null;
  
  // Actions
  setActiveTab: (tab: 'interviewee' | 'interviewer') => void;
  createCandidate: (resumeText?: string) => string;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  setCurrentCandidate: (id: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  startInterview: (candidateId: string) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  pauseInterview: () => void;
  resumeInterview: () => void;
  startTimer: (timeLimit: number) => void;
  stopTimer: () => void;
  calculateScore: (candidateId: string) => void;
  setShowWelcomeBack: (show: boolean) => void;
  
  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'score' | 'name' | 'date';
  setSortBy: (sortBy: 'score' | 'name' | 'date') => void;
}

// Mock AI questions for different difficulties
const MOCK_QUESTIONS: Record<QuestionDifficulty, string[]> = {
  easy: [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain what React components are and how they work.",
    "What is the purpose of the virtual DOM in React?",
    "How do you handle events in React?",
  ],
  medium: [
    "Explain the concept of closures in JavaScript with an example.",
    "What are React hooks and why were they introduced?",
    "How would you optimize a React application's performance?",
    "Explain the difference between REST and GraphQL APIs.",
    "What is event delegation and how does it work?",
  ],
  hard: [
    "Implement a debounce function from scratch and explain its use cases.",
    "Design a scalable frontend architecture for a large React application.",
    "Explain how you would handle state management in a complex React app.",
    "How would you implement server-side rendering with React?",
    "Design a caching strategy for a full-stack web application.",
  ],
};

const TIME_LIMITS = {
  easy: 20,
  medium: 60, 
  hard: 120,
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCandidateId: null,
      activeTab: 'interviewee',
      showWelcomeBack: false,
      candidates: [],
      chatMessages: [],
      isInterviewActive: false,
      currentTimer: 0,
      timerInterval: null,
      searchQuery: '',
      sortBy: 'date',

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),

      createCandidate: (resumeText) => {
        const id = `candidate-${Date.now()}`;
        const candidate: Candidate = {
          id,
          resumeText,
          status: resumeText ? 'collecting-info' : 'not-started',
          currentQuestionIndex: 0,
          questions: [],
          answers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          candidates: [...state.candidates, candidate],
          currentCandidateId: id,
        }));

        return id;
      },

      updateCandidate: (id, updates) => {
        set((state) => ({
          candidates: state.candidates.map((candidate) =>
            candidate.id === id
              ? { ...candidate, ...updates, updatedAt: new Date() }
              : candidate
          ),
        }));
      },

      setCurrentCandidate: (id) => {
        const candidate = get().candidates.find((c) => c.id === id);
        if (candidate && candidate.status !== 'not-started' && candidate.status !== 'completed') {
          set({ showWelcomeBack: true });
        }
        set({ currentCandidateId: id });
      },

      addChatMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: new Date(),
        };
        set((state) => ({
          chatMessages: [...state.chatMessages, newMessage],
        }));
      },

      startInterview: (candidateId) => {
        // Generate 6 questions: 2 easy, 2 medium, 2 hard
        const questions: Question[] = [];
        
        // Add 2 easy questions
        const easyQuestions = [...MOCK_QUESTIONS.easy].sort(() => Math.random() - 0.5).slice(0, 2);
        easyQuestions.forEach((text, index) => {
          questions.push({
            id: `q-easy-${index}`,
            text,
            difficulty: 'easy',
            timeLimit: TIME_LIMITS.easy,
          });
        });

        // Add 2 medium questions  
        const mediumQuestions = [...MOCK_QUESTIONS.medium].sort(() => Math.random() - 0.5).slice(0, 2);
        mediumQuestions.forEach((text, index) => {
          questions.push({
            id: `q-medium-${index}`,
            text,
            difficulty: 'medium',
            timeLimit: TIME_LIMITS.medium,
          });
        });

        // Add 2 hard questions
        const hardQuestions = [...MOCK_QUESTIONS.hard].sort(() => Math.random() - 0.5).slice(0, 2);
        hardQuestions.forEach((text, index) => {
          questions.push({
            id: `q-hard-${index}`,
            text,
            difficulty: 'hard',
            timeLimit: TIME_LIMITS.hard,
          });
        });

        get().updateCandidate(candidateId, {
          status: 'in-progress',
          questions,
          currentQuestionIndex: 0,
        });

        set({ isInterviewActive: true });
        
        // Start with first question
        const firstQuestion = questions[0];
        get().addChatMessage({
          type: 'ai',
          content: `Let's begin the interview! Here's your first question (${firstQuestion.difficulty} - ${firstQuestion.timeLimit}s):\n\n${firstQuestion.text}`,
        });
        
        get().startTimer(firstQuestion.timeLimit);
      },

      submitAnswer: (answer) => {
        const { currentCandidateId, candidates } = get();
        if (!currentCandidateId) return;

        const candidate = candidates.find((c) => c.id === currentCandidateId);
        if (!candidate) return;

        const currentQuestion = candidate.questions[candidate.currentQuestionIndex];
        if (!currentQuestion) return;

        const timeSpent = currentQuestion.timeLimit - get().currentTimer;
        
        const newAnswer: Answer = {
          questionId: currentQuestion.id,
          text: answer,
          timeSpent,
          timestamp: new Date(),
        };

        // Mock AI scoring (random for now)
        const score = Math.floor(Math.random() * 6) + 5; // 5-10 range
        const updatedQuestion = { ...currentQuestion, score };

        get().updateCandidate(currentCandidateId, {
          answers: [...candidate.answers, newAnswer],
          questions: candidate.questions.map((q) =>
            q.id === currentQuestion.id ? updatedQuestion : q
          ),
        });

        get().addChatMessage({
          type: 'user',
          content: answer,
        });

        get().stopTimer();
        get().nextQuestion();
      },

      nextQuestion: () => {
        const { currentCandidateId, candidates } = get();
        if (!currentCandidateId) return;

        const candidate = candidates.find((c) => c.id === currentCandidateId);
        if (!candidate) return;

        const nextIndex = candidate.currentQuestionIndex + 1;

        if (nextIndex >= candidate.questions.length) {
          // Interview completed
          get().updateCandidate(currentCandidateId, {
            status: 'completed',
            currentQuestionIndex: nextIndex,
          });
          
          get().calculateScore(currentCandidateId);
          set({ isInterviewActive: false });
          
          get().addChatMessage({
            type: 'ai',
            content: 'Congratulations! You have completed the interview. Your responses are being evaluated.',
          });
        } else {
          // Next question
          get().updateCandidate(currentCandidateId, {
            currentQuestionIndex: nextIndex,
          });

          const nextQuestion = candidate.questions[nextIndex];
          get().addChatMessage({
            type: 'ai',
            content: `Question ${nextIndex + 1} of ${candidate.questions.length} (${nextQuestion.difficulty} - ${nextQuestion.timeLimit}s):\n\n${nextQuestion.text}`,
          });
          
          get().startTimer(nextQuestion.timeLimit);
        }
      },

      pauseInterview: () => {
        const { currentCandidateId } = get();
        if (currentCandidateId) {
          get().updateCandidate(currentCandidateId, { status: 'paused' });
        }
        get().stopTimer();
        set({ isInterviewActive: false });
      },

      resumeInterview: () => {
        const { currentCandidateId, candidates } = get();
        if (!currentCandidateId) return;

        const candidate = candidates.find((c) => c.id === currentCandidateId);
        if (!candidate) return;

        get().updateCandidate(currentCandidateId, { status: 'in-progress' });
        set({ isInterviewActive: true, showWelcomeBack: false });

        const currentQuestion = candidate.questions[candidate.currentQuestionIndex];
        if (currentQuestion) {
          get().startTimer(currentQuestion.timeLimit);
        }
      },

      startTimer: (timeLimit) => {
        get().stopTimer(); // Clear any existing timer
        set({ currentTimer: timeLimit });

        const interval = setInterval(() => {
          const newTime = get().currentTimer - 1;
          if (newTime <= 0) {
            get().stopTimer();
            get().submitAnswer(''); // Auto-submit empty answer when time runs out
          } else {
            set({ currentTimer: newTime });
          }
        }, 1000);

        set({ timerInterval: interval });
      },

      stopTimer: () => {
        const { timerInterval } = get();
        if (timerInterval) {
          clearInterval(timerInterval);
          set({ timerInterval: null, currentTimer: 0 });
        }
      },

      calculateScore: (candidateId) => {
        const candidate = get().candidates.find((c) => c.id === candidateId);
        if (!candidate) return;

        const totalScore = candidate.questions.reduce((sum, q) => sum + (q.score || 0), 0);
        const avgScore = totalScore / candidate.questions.length;
        const finalScore = Math.round(avgScore * 10); // Scale to 100

        const summary = `Interview completed with ${candidate.questions.length} questions answered. Average score: ${avgScore.toFixed(1)}/10. Performance: ${
          avgScore >= 8 ? 'Excellent' : avgScore >= 6 ? 'Good' : avgScore >= 4 ? 'Average' : 'Needs Improvement'
        }.`;

        get().updateCandidate(candidateId, {
          finalScore,
          summary,
        });

        get().addChatMessage({
          type: 'system',
          content: `Interview completed! Final score: ${finalScore}/100\n\n${summary}`,
        });
      },

      setShowWelcomeBack: (show) => set({ showWelcomeBack: show }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sortBy) => set({ sortBy }),
    }),
    {
      name: 'crisp-interview-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        candidates: state.candidates,
        currentCandidateId: state.currentCandidateId,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
      }),
    }
  )
);