import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  difficulty: string;
}

const Interview = () => {
  const [course, setCourse] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourseAndQuestions();
    }
  }, [courseId]);

  const fetchCourseAndQuestions = async () => {
    const [courseRes, questionsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('id', courseId).single(),
      supabase.from('questions').select('*').eq('course_id', courseId)
    ]);

    if (courseRes.data) setCourse(courseRes.data);
    if (questionsRes.data) setQuestions(questionsRes.data);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setInterviewStarted(true);
      speakQuestion(questions[0].question_text);
    } catch (error) {
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera and microphone access',
        variant: 'destructive'
      });
    }
  };

  const speakQuestion = async (text: string) => {
    setIsProcessing(true);
    setAiResponse(text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => {
      setIsProcessing(false);
    };
    speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAnswer(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: 'Recording started' });
    } catch (error) {
      toast({
        title: 'Microphone access denied',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: 'Recording stopped' });
    }
  };

  const processAnswer = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result?.toString().split(',')[1];
      
      try {
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        const transcription = data.text || 'No response detected';
        setAnswers([...answers, transcription]);
        
        toast({ title: 'Answer recorded', description: transcription.substring(0, 50) + '...' });
        
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setTimeout(() => {
            speakQuestion(questions[currentQuestionIndex + 1].question_text);
          }, 2000);
        } else {
          await completeInterview();
        }
      } catch (error) {
        toast({
          title: 'Error processing answer',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const completeInterview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('interviews').insert([{
      student_id: user.id,
      course_id: courseId,
      questions_answered: questions.length,
      result_summary: { answers }
    }]);

    toast({ title: 'Interview completed!' });
    setTimeout(() => navigate('/interviews'), 2000);
  };

  if (!course || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{course.title} Interview</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Student Camera */}
          <Card className="shadow-elegant overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="relative h-full bg-black">
                <video 
                  ref={videoRef}
                  autoPlay 
                  muted 
                  className="w-full h-full object-cover"
                />
                {!interviewStarted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Button 
                      size="lg"
                      className="bg-gradient-hero"
                      onClick={startCamera}
                    >
                      Start Interview
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Interviewer */}
          <Card className="shadow-elegant">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-32 h-32 mx-auto bg-gradient-hero rounded-full flex items-center justify-center animate-pulse">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                  
                  {interviewStarted && (
                    <>
                      <div className="space-y-2">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          questions[currentQuestionIndex].difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          questions[currentQuestionIndex].difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {questions[currentQuestionIndex].difficulty}
                        </span>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-6">
                        <p className="text-lg font-medium">
                          {questions[currentQuestionIndex].question_text}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {interviewStarted && !isProcessing && (
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <Button 
                      size="lg"
                      className="bg-gradient-hero"
                      onClick={startRecording}
                    >
                      <Mic className="mr-2 h-5 w-5" />
                      Start Answer
                    </Button>
                  ) : (
                    <Button 
                      size="lg"
                      variant="destructive"
                      onClick={stopRecording}
                    >
                      <MicOff className="mr-2 h-5 w-5" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Interview;
