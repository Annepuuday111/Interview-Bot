import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ArrowLeft, Video, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
}

const CourseDetails = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchQuestionCount();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (data) setCourse(data);
  };

  const fetchQuestionCount = async () => {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId);
    
    setQuestionCount(count || 0);
  };

  const handleStartInterview = () => {
    if (questionCount === 0) {
      toast({
        title: 'No questions available',
        description: 'This course does not have any questions yet.',
        variant: 'destructive'
      });
      return;
    }
    navigate(`/interview/${courseId}`);
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/courses')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Course Details
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full">
                {course.category || 'General'}
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{questionCount} Questions</span>
              </div>
            </div>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
            <CardDescription className="text-base mt-4">
              {course.description || 'Master this topic with our AI-powered interview practice'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3">What to expect:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  AI-powered interview simulation
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Real-time question and answer session
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Voice recording of your responses
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Practice at your own pace
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-gradient-hero hover:opacity-90 h-12 text-lg"
                onClick={handleStartInterview}
                disabled={questionCount === 0}
              >
                <Video className="mr-2 h-5 w-5" />
                Take Interview
              </Button>
              {questionCount === 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  No questions available for this course yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetails;
