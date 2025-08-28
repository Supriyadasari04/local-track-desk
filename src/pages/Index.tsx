import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Ticket, CheckCircle, Users, BarChart3, ArrowRight, Shield, Clock } from 'lucide-react';
import { getLoggedInUser } from '@/services/authService';
import { initializeSampleData } from '@/services/storageService';

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getLoggedInUser());

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
    
    // Check if user is already logged in
    const currentUser = getLoggedInUser();
    if (currentUser) {
      // Redirect to appropriate dashboard based on role
      navigate(`/${currentUser.role}`);
    }
  }, [navigate]);

  const features = [
    {
      icon: Ticket,
      title: "Smart Ticket Management",
      description: "Create, assign, and track support tickets with ease"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for customers, agents, and administrators"
    },
    {
      icon: BarChart3,
      title: "Real-Time Updates",
      description: "Live status updates and notifications across all sessions"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with local data management"
    }
  ];

  const stats = [
    { label: "Tickets Resolved", value: "10K+", color: "text-accent" },
    { label: "Response Time", value: "< 1hr", color: "text-primary" },
    { label: "Satisfaction", value: "99%", color: "text-success" }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-surface-foreground">TicketPro</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="hero" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary-light text-primary border-0">
              Professional Support System
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 text-surface-foreground">
              Streamline Your
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Support Workflow</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional ticket management system designed for teams. 
              Create, assign, and resolve customer support tickets efficiently.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button variant="hero" size="lg" onClick={() => navigate('/signup')}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                View Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-surface-foreground">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for modern support teams with all the features you need to deliver exceptional customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-surface-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of teams already using TicketPro to deliver amazing customer support.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button variant="hero" size="lg" onClick={() => navigate('/signup')}>
                Create Account
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-accent" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-primary rounded-md flex items-center justify-center">
                <Ticket className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-surface-foreground">TicketPro</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 TicketPro. Professional support management.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
