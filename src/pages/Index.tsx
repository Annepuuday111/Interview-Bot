import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, Video, Award, Zap, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (profile) {
        navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
      }
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Interviews",
      description: "Practice with advanced AI that simulates real interview scenarios"
    },
    {
      icon: Video,
      title: "Real-time Feedback",
      description: "Get instant feedback on your responses and body language"
    },
    {
      icon: Award,
      title: "Multiple Courses",
      description: "Choose from various technical and behavioral topics"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Track your progress and review past sessions anytime"
    }
  ];

  const benefits = [
    "Practice unlimited mock interviews",
    "Build confidence before real interviews",
    "Improve communication skills",
    "Access 24/7 from anywhere"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="container mx-auto px-6 pt-20 pb-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">The Future of Interview Preparation</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Master Interviews with{' '}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                AI Precision
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice with our advanced AI interviewer. Get real-time feedback, improve your skills, 
              and land your dream job with confidence.
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                size="lg"
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8 shadow-elegant"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground">Everything you need to ace your interviews</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-elegant transition-all group border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mb-4 p-3 bg-gradient-hero rounded-lg w-fit group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Transform Your Interview Skills
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI-powered platform provides personalized interview practice that adapts to your needs.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg"
                className="bg-gradient-hero hover:opacity-90 transition-opacity mt-6"
                onClick={() => navigate('/auth')}
              >
                Start Practicing Now
              </Button>
            </div>
            
            <Card className="shadow-elegant bg-gradient-card">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                <CardDescription className="text-base">
                  Join thousands of successful candidates who improved their interview skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">For Students</div>
                    <div className="text-sm text-muted-foreground">
                      Practice unlimited interviews and get instant feedback
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg">
                  <div className="p-2 bg-accent/10 rounded">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">For Admins</div>
                    <div className="text-sm text-muted-foreground">
                      Create courses and manage interview questions easily
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start practicing today and build the confidence you need to succeed
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate('/auth')}
          >
            Create Your Free Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
