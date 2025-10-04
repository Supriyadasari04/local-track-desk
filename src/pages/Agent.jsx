import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { UserCheck, LogOut, Ticket, Search, Clock, CheckCircle } from 'lucide-react';
import { getLoggedInUser, logout } from '@/services/authService';
import { getTicketsForUser, getAllTickets, updateTicketStatus } from '@/services/ticketService';
import { getUserById } from '@/services/storageService';
import { TicketCard } from '@/components/TicketCard';
import { useToast } from '@/hooks/use-toast';

const Agent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getLoggedInUser());
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'agent') {
      navigate('/login');
      return;
    }

    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tms_tickets') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, navigate]);

  const loadData = () => {
    if (!user) return;
    
    const tickets = getAllTickets().map(ticket => ({
      ...ticket,
      customerName: getUserById(ticket.createdBy)?.username || 'Unknown',
      agentName: ticket.assignedTo ? getUserById(ticket.assignedTo)?.username || 'Unknown' : undefined
    }));
    setAllTickets(tickets);
  };

  const handleStatusChange = (ticketId: string, status: string) => {
    updateTicketStatus(ticketId, status);
    toast({
      title: "Status Updated",
      description: `Ticket status changed to ${status.replace('_', ' ')}.`,
    });
    loadData();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter tickets by agent and status
  const assignedTickets = allTickets.filter(t => 
    t.assignedTo === user?.id && 
    (t.status === 'assigned' || t.status === 'in_progress') &&
    (t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingTickets = allTickets.filter(t => 
    t.status === 'pending' &&
    (t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resolvedTickets = allTickets.filter(t => 
    t.assignedTo === user?.id && 
    t.status === 'resolved' &&
    (t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    {
      title: "Assigned to Me",
      value: assignedTickets.length,
      icon: UserCheck,
      color: "text-primary"
    },
    {
      title: "Pending",
      value: pendingTickets.length,
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Resolved by Me",
      value: resolvedTickets.length,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Total Tickets",
      value: allTickets.length,
      icon: Ticket,
      color: "text-accent"
    }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-foreground">Agent Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.username}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-surface-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Ticket Tabs */}
        <Tabs defaultValue="assigned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assigned">Assigned Tickets ({assignedTickets.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Tickets ({pendingTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved Tickets ({resolvedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-6">
            {assignedTickets.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-surface-foreground mb-2">No assigned tickets</h3>
                  <p className="text-muted-foreground">No tickets are currently assigned to you.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    userRole="agent"
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingTickets.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-surface-foreground mb-2">No pending tickets</h3>
                  <p className="text-muted-foreground">All tickets have been assigned to agents.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    userRole="agent"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-6">
            {resolvedTickets.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-surface-foreground mb-2">No resolved tickets</h3>
                  <p className="text-muted-foreground">You haven't resolved any tickets yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resolvedTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    userRole="agent"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Agent;