import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Download, 
  Trash2, 
  Palette 
} from 'lucide-react';

interface WhiteboardProps {
  isVisible: boolean;
  onSave?: (imageData: string) => void;
}

export const Whiteboard = ({ isVisible, onSave }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'draw' | 'rectangle' | 'circle' | 'text' | 'eraser'>('draw');
  const [activeColor, setActiveColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#22c55e', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#f97316', // orange
    '#000000', // black
  ];

  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: '#ffffff',
    });

    // Initialize drawing brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushSize;
    canvas.isDrawingMode = true;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === 'draw' || activeTool === 'eraser';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : activeColor;
      fabricCanvas.freeDrawingBrush.width = activeTool === 'eraser' ? brushSize * 3 : brushSize;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === 'rectangle') {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(rect);
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: 2,
        radius: 50,
      });
      fabricCanvas.add(circle);
    }
  };

  const handleUndo = () => {
    // Undo functionality would require implementing custom history
    console.log('Undo functionality needs custom implementation');
  };

  const handleRedo = () => {
    // Redo functionality would require implementing custom history
    console.log('Redo functionality needs custom implementation');
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = dataURL;
    link.click();

    onSave?.(dataURL);
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Interactive Whiteboard
          </CardTitle>
          <Badge variant="outline">
            {activeTool}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
          <div className="flex gap-1">
            <Button
              variant={activeTool === 'draw' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolClick('draw')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'eraser' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolClick('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolClick('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleToolClick('circle')}
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Color Picker */}
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  activeColor === color ? 'border-gray-600' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setActiveColor(color)}
              />
            ))}
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-sm w-6">{brushSize}</span>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          {/* Actions */}
          <div className="flex gap-1 ml-auto">
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleRedo}>
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <canvas 
            ref={canvasRef}
            className="max-w-full cursor-crosshair"
          />
        </div>
        
        <div className="mt-3 text-sm text-muted-foreground text-center">
          Use the tools above to draw, add shapes, or sketch your solution
        </div>
      </CardContent>
    </Card>
  );
};