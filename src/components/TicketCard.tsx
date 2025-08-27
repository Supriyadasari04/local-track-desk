import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, User, AlertCircle } from "lucide-react";

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  agentName?: string;
}

interface TicketCardProps {
  ticket: Ticket;
  userRole: 'admin' | 'agent' | 'customer';
  agents?: Array<{ id: string; username: string }>;
  onAssign?: (ticketId: string, agentId: string) => void;
  onStatusChange?: (ticketId: string, status: string) => void;
}

const priorityColors = {
  Low: 'bg-accent-light text-accent-foreground',
  Medium: 'bg-warning/10 text-warning-foreground',
  High: 'bg-destructive/10 text-destructive-foreground'
};

const statusColors = {
  pending: 'bg-warning/10 text-warning-foreground',
  assigned: 'bg-primary-light text-primary',
  in_progress: 'bg-primary text-primary-foreground',
  resolved: 'bg-accent text-accent-foreground'
};

export const TicketCard = ({ 
  ticket, 
  userRole, 
  agents = [], 
  onAssign, 
  onStatusChange 
}: TicketCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{ticket.id}</CardTitle>
          <div className="flex gap-2">
            <Badge className={priorityColors[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge className={statusColors[ticket.status]}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <h3 className="font-medium text-surface-foreground">{ticket.subject}</h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {ticket.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{ticket.customerName || 'Customer'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {ticket.assignedTo && (
          <div className="flex items-center gap-1 text-sm">
            <AlertCircle className="h-4 w-4 text-accent" />
            <span className="text-accent font-medium">
              Assigned to: {ticket.agentName || 'Agent'}
            </span>
          </div>
        )}
        
        {/* Admin Controls */}
        {userRole === 'admin' && ticket.status === 'pending' && (
          <div className="pt-2">
            <Select onValueChange={(value) => onAssign?.(ticket.id, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assign to agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Agent Controls */}
        {userRole === 'agent' && ticket.assignedTo && (
          <div className="pt-2">
            <Select 
              value={ticket.status} 
              onValueChange={(value) => onStatusChange?.(ticket.id, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};