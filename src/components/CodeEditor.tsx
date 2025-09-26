import { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Download, Code2, CheckCircle } from 'lucide-react';

interface CodeEditorProps {
  isVisible: boolean;
  onCodeSubmit: (code: string, language: string) => void;
  question?: string;
}

export const CodeEditor = ({ isVisible, onCodeSubmit, question }: CodeEditorProps) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<any>(null);

  const languageTemplates = {
    javascript: `// Solve the coding problem here
function solution() {
    // Your code here
    return null;
}

// Test your solution
console.log(solution());`,
    python: `# Solve the coding problem here
def solution():
    # Your code here
    return None

# Test your solution
print(solution())`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Set theme
    monaco.editor.setTheme('vs-dark');
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: false },
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      selectOnLineNumbers: true,
      automaticLayout: true
    });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage as keyof typeof languageTemplates] || '');
    setOutput('');
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate code execution
    setTimeout(() => {
      try {
        if (language === 'javascript') {
          // Basic JavaScript execution simulation
          let result = 'Code executed successfully!\n';
          if (code.includes('console.log')) {
            result += 'Output: Hello, World!\n';
          }
          setOutput(result);
        } else {
          setOutput(`Code execution simulated for ${language}\nThis would connect to a real code execution service in production.`);
        }
      } catch (error) {
        setOutput(`Error: ${error}`);
      }
      setIsRunning(false);
    }, 2000);
  };

  const resetCode = () => {
    setCode(languageTemplates[language as keyof typeof languageTemplates] || '');
    setOutput('');
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${language === 'javascript' ? 'js' : language}`;
    a.click();
  };

  const submitCode = () => {
    onCodeSubmit(code, language);
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Code Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              {language}
            </Badge>
          </div>
        </div>
        
        {question && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Coding Challenge:</p>
            <p className="text-sm text-muted-foreground">{question}</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[500px]">
        <div className="flex-1 border rounded-lg overflow-hidden">
          <Editor
            height="300px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorDidMount}
            options={{
              theme: 'vs-dark',
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true
            }}
          />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex gap-2 mb-3">
            <Button onClick={runCode} disabled={isRunning} size="sm">
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run Code'}
            </Button>
            <Button variant="outline" onClick={resetCode} size="sm">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" onClick={downloadCode} size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button onClick={submitCode} variant="default" size="sm" className="ml-auto">
              <CheckCircle className="h-4 w-4 mr-1" />
              Submit Solution
            </Button>
          </div>
          
          {output && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Output:</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {output}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};