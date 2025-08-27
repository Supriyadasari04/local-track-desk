import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Ticket, LogOut, Mail, User, Clock } from 'lucide-react';
import { getLoggedInUser, logout } from '@/services/authService';
import { createTicket, getTicketsForUser, DEFAULT_SUBJECTS } from '@/services/ticketService';
import { getUserEmails, getUnreadCount } from '@/services/emailService';
import { TicketCard } from '@/components/TicketCard';
import { useToast } from '@/hooks/use-toast';

const Customer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getLoggedInUser());
  const [tickets, setTickets] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    customSubject: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
      return;
    }

    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tms_tickets' || e.key === 'tms_emails') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, navigate]);

  const loadData = () => {
    if (!user) return;
    
    const userTickets = getTicketsForUser(user.id, 'customer');
    setTickets(userTickets);
    
    const userEmails = getUserEmails(user.id);
    setEmails(userEmails);
    
    const unread = getUnreadCount(user.id);
    setUnreadCount(unread);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const ticketSubject = formData.subject === 'Other' ? formData.customSubject : formData.subject;
    
    const ticket = createTicket({
      subject: ticketSubject,
      description: formData.description,
      priority: formData.priority,
      createdBy: user.id
    });

    toast({
      title: "Ticket Created",
      description: `Ticket ${ticket.id} has been created successfully.`,
    });

    setFormData({
      subject: '',
      customSubject: '',
      description: '',
      priority: 'Medium'
    });
    setIsDialogOpen(false);
    loadData();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-foreground">Customer Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="relative">
                <Mail className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-foreground">{tickets.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-foreground">
                    {tickets.filter(t => t.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-foreground">
                    {tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-surface-foreground">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-surface-foreground">My Tickets</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll help you resolve it.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.subject === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="customSubject">Custom Subject</Label>
                    <Input
                      id="customSubject"
                      value={formData.customSubject}
                      onChange={(e) => setFormData(prev => ({ ...prev, customSubject: e.target.value }))}
                      placeholder="Describe your issue"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your issue"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    Create Ticket
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets Grid */}
        {tickets.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-surface-foreground mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">Create your first support ticket to get started.</p>
              <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                userRole="customer"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customer;