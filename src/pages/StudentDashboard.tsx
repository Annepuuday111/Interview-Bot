import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Video, HelpCircle, LogOut, Brain, Award, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface Stats {
  totalInterviews: number;
  availableCourses: number;
}

const StudentDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<Stats>({ totalInterviews: 0, availableCourses: 0 });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchCourses();
    fetchStats();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role === 'admin') {
      navigate('/admin');
      return;
    }
    
    setUser(user);
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (data) setCourses(data);
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [interviewsRes, coursesRes] = await Promise.all([
      supabase.from('interviews').select('id', { count: 'exact' }).eq('student_id', user.id),
      supabase.from('courses').select('id', { count: 'exact' })
    ]);

    setStats({
      totalInterviews: interviewsRes.count || 0,
      availableCourses: coursesRes.count || 0
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Student Portal
            </h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">Practice sessions completed</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.availableCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Subjects to master</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInterviews * 15} min</div>
              <p className="text-xs text-muted-foreground mt-1">Total practice time</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-all cursor-pointer group" onClick={() => navigate('/courses')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-hero rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Browse Courses</CardTitle>
                  <CardDescription>Explore available interview topics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access all available courses and start practicing with our AI interviewer
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all cursor-pointer group" onClick={() => navigate('/interviews')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>My Interviews</CardTitle>
                  <CardDescription>View your practice history</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review your past interview sessions and track your progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="shadow-card hover:shadow-elegant transition-all group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {course.category || 'General'}
                    </div>
                  </div>
                  <CardTitle className="mt-3">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-gradient-hero hover:opacity-90" 
                    onClick={() => navigate(`/interview/${course.id}`)}
                  >
                    Start Interview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
