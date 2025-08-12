// src/components/EmotionalSupport/EmotionalSupportPanel.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Play, Pause, RotateCcw, Sparkles, 
  MessageCircle, Coffee, Sun, CloudRain 
} from "lucide-react";
import { useEmotionalSupport } from "@/hooks/useAdvancedFeatures";
import { toast } from "@/hooks/use-toast";

interface EmotionalSupportPanelProps {
  userMessage?: string;
  onRecommendationSelect?: (recommendation: string) => void;
}

export const EmotionalSupportPanel = ({ 
  userMessage, 
  onRecommendationSelect 
}: EmotionalSupportPanelProps) => {
  const { currentEmotion, isAnalyzing, analyzeEmotion, getTherapeuticRecommendations } = useEmotionalSupport();
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Analyze emotion when user message changes
  useEffect(() => {
    if (userMessage) {
      analyzeEmotion(userMessage);
    }
  }, [userMessage, analyzeEmotion]);

  // Breathing exercise timer
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathingProgress(prev => {
        if (prev >= 100) {
          // Cycle through phases: inhale (4s) -> hold (4s) -> exhale (6s)
          setBreathingPhase(current => {
            if (current === 'inhale') return 'hold';
            if (current === 'hold') return 'exhale';
            return 'inhale';
          });
          return 0;
        }
        return prev + (100 / (breathingPhase === 'exhale' ? 60 : 40)); // Different durations
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase]);

  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    setBreathingProgress(0);
    setBreathingPhase('inhale');
    toast({
      title: "Breathing Exercise Started",
      description: "Follow the rhythm to help calm your mind",
    });
  };

  const stopBreathingExercise = () => {
    setIsBreathingActive(false);
    setBreathingProgress(0);
    setBreathingPhase('inhale');
  };

  const getEmotionIcon = (emotion: string) => {
    const emotionMap: Record<string, JSX.Element> = {
      happy: <Sun className="h-5 w-5 text-yellow-500" />,
      sad: <CloudRain className="h-5 w-5 text-blue-500" />,
      stressed: <Heart className="h-5 w-5 text-red-500" />,
      excited: <Sparkles className="h-5 w-5 text-purple-500" />,
      calm: <Heart className="h-5 w-5 text-green-500" />,
    };
    return emotionMap[emotion.toLowerCase()] || <Heart className="h-5 w-5 text-gray-500" />;
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Breathe in slowly...';
      case 'hold':
        return 'Hold your breath...';
      case 'exhale':
        return 'Breathe out slowly...';
    }
  };

  const affirmations = [
    "You are capable of amazing things ✨",
    "This moment will pass, and you will be stronger 💪",
    "You deserve kindness, especially from yourself 💕",
    "Every breath brings you closer to peace 🌸",
    "You are exactly where you need to be right now 🌟"
  ];

  const [currentAffirmation, setCurrentAffirmation] = useState(0);

  const nextAffirmation = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };

  if (!currentEmotion && !isAnalyzing) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Emotional Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Share your feelings and I'll provide personalized support and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Emotion Detection */}
      {(currentEmotion || isAnalyzing) && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Emotion Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex items-center gap-3 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Analyzing your emotional state...</span>
              </div>
            ) : currentEmotion ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getEmotionIcon(currentEmotion.emotion)}
                  <div>
                    <h4 className="font-semibold capitalize">{currentEmotion.emotion}</h4>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(currentEmotion.confidence * 100)}%
                    </p>
                  </div>
                </div>
                
                {currentEmotion.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Recommended for you:</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentEmotion.recommendations.map((rec, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => onRecommendationSelect?.(rec)}
                          className="text-xs"
                        >
                          <Coffee className="h-3 w-3 mr-1" />
                          {rec}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Breathing Exercise */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Breathing Exercise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isBreathingActive ? (
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full mx-auto transition-all duration-1000 ${
                    breathingPhase === 'inhale' ? 'bg-blue-200 scale-110' :
                    breathingPhase === 'hold' ? 'bg-purple-200 scale-110' :
                    'bg-green-200 scale-90'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className={`h-8 w-8 transition-colors duration-500 ${
                      breathingPhase === 'inhale' ? 'text-blue-600' :
                      breathingPhase === 'hold' ? 'text-purple-600' :
                      'text-green-600'
                    }`} />
                  </div>
                </div>
                
                <div>
                  <p className="text-lg font-medium">{getBreathingInstruction()}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {breathingPhase} phase
                  </p>
                </div>
                
                <Progress value={breathingProgress} className="w-full" />
                
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={stopBreathingExercise}>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setBreathingProgress(0);
                    setBreathingPhase('inhale');
                  }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Take a moment to center yourself with guided breathing
                </p>
                <Button onClick={startBreathingExercise}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Breathing Exercise
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Positive Affirmations */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Positive Affirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
              <p className="text-lg font-medium">{affirmations[currentAffirmation]}</p>
            </div>
            <Button variant="outline" onClick={nextAffirmation}>
              <Sparkles className="h-4 w-4 mr-2" />
              New Affirmation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};