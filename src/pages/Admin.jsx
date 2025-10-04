import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Shield, LogOut, Users, Ticket, Search, Plus, UserCheck, UserX } from 'lucide-react';
import { getLoggedInUser, logout } from '@/services/authService';
import { getAllTickets, assignTicket } from '@/services/ticketService';
import { getAllUsers, getUserById } from '@/services/storageService';
import { TicketCard } from '@/components/TicketCard';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getLoggedInUser());
  const [tickets, setTickets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tms_tickets' || e.key === 'tms_users') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, navigate]);

  const loadData = () => {
    const allTickets = getAllTickets().map(ticket => ({
      ...ticket,
      customerName: getUserById(ticket.createdBy)?.username || 'Unknown',
      agentName: ticket.assignedTo ? getUserById(ticket.assignedTo)?.username || 'Unknown' : undefined
    }));
    setTickets(allTickets);
    
    const allUsers = getAllUsers();
    setUsers(allUsers);
    setAgents(allUsers.filter(u => u.role === 'agent' && u.isActive));
  };

  const handleAssignTicket = (ticketId: string, agentId: string) => {
    assignTicket(ticketId, agentId);
    toast({
      title: "Ticket Assigned",
      description: "Ticket has been assigned to the agent.",
    });
    loadData();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      title: "Total Tickets",
      value: tickets.length,
      icon: Ticket,
      color: "text-primary"
    },
    {
      title: "Pending",
      value: tickets.filter(t => t.status === 'pending').length,
      icon: Ticket,
      color: "text-warning"
    },
    {
      title: "In Progress",
      value: tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length,
      icon: UserCheck,
      color: "text-accent"
    },
    {
      title: "Resolved",
      value: tickets.filter(t => t.status === 'resolved').length,
      icon: UserCheck,
      color: "text-success"
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
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-foreground">Admin Dashboard</h1>
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

        {/* Main Content */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">Ticket Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
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

            {/* Tickets Grid */}
            {filteredTickets.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-surface-foreground mb-2">No tickets found</h3>
                  <p className="text-muted-foreground">No tickets match your search criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    userRole="admin"
                    agents={agents}
                    onAssign={handleAssignTicket}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-surface-foreground">User Management</h2>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Users Table */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-foreground">{userData.username}</p>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={userData.role === 'admin' ? 'default' : userData.role === 'agent' ? 'secondary' : 'outline'}>
                          {userData.role.toUpperCase()}
                        </Badge>
                        <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                          {userData.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;