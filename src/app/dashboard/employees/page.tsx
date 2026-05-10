"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Plus, User, Mail, Phone, Calendar, Star, DollarSign, Briefcase } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  initials: string;
  color: string;
  role: string;
  status: string;
  department: string;
  salary: string;
  rating: number;
  phone: string;
  email: string;
  joined: string;
};

const HARDCODED_EMPLOYEES: Employee[] = [
  { id: 1, name: "Thomas Anderson", initials: "TA", color: "bg-blue-500", role: "Manager", status: "Active", department: "Operations", salary: "$6,500/mo", rating: 5, phone: "+1 555-0100", email: "tanderson@example.com", joined: "Jan 10, 2020" },
  { id: 2, name: "Sophia Martinez", initials: "SM", color: "bg-purple-500", role: "Agent", status: "Active", department: "Customer Service", salary: "$3,200/mo", rating: 4, phone: "+1 555-0122", email: "smartinez@example.com", joined: "Mar 15, 2023" },
  { id: 3, name: "Marcus Johnson", initials: "MJ", color: "bg-emerald-500", role: "Mechanic", status: "Off", department: "Maintenance", salary: "$4,800/mo", rating: 5, phone: "+1 555-0144", email: "mjohnson@example.com", joined: "Nov 02, 2021" },
  { id: 4, name: "Elena Rodriguez", initials: "ER", color: "bg-amber-500", role: "Agent", status: "Active", department: "Customer Service", salary: "$3,400/mo", rating: 4, phone: "+1 555-0166", email: "erodriguez@example.com", joined: "Aug 20, 2022" },
  { id: 5, name: "William Davis", initials: "WD", color: "bg-red-500", role: "Driver", status: "Active", department: "Transport", salary: "$2,900/mo", rating: 3, phone: "+1 555-0188", email: "wdavis@example.com", joined: "Feb 14, 2024" },
  { id: 6, name: "Jessica Taylor", initials: "JT", color: "bg-pink-500", role: "Manager", status: "Active", department: "Finance", salary: "$6,200/mo", rating: 5, phone: "+1 555-0200", email: "jtaylor@example.com", joined: "Sep 05, 2019" },
  { id: 7, name: "Daniel White", initials: "DW", color: "bg-cyan-500", role: "Mechanic", status: "Active", department: "Maintenance", salary: "$4,500/mo", rating: 4, phone: "+1 555-0222", email: "dwhite@example.com", joined: "Jun 18, 2022" },
  { id: 8, name: "Olivia Brown", initials: "OB", color: "bg-indigo-500", role: "Driver", status: "Off", department: "Transport", salary: "$2,800/mo", rating: 4, phone: "+1 555-0244", email: "obrown@example.com", joined: "Oct 30, 2024" },
];

export default function EmployeesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "Manager": return <Badge className="bg-purple-500 hover:bg-purple-600">Manager</Badge>;
      case "Agent": return <Badge className="bg-blue-500 hover:bg-blue-600">Agent</Badge>;
      case "Mechanic": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Mechanic</Badge>;
      case "Driver": return <Badge className="bg-amber-500 hover:bg-amber-600">Driver</Badge>;
      default: return <Badge>{role}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground opacity-30"}`} />
        ))}
      </div>
    );
  };

  const generateAttendanceGrid = () => {
    const grid = [];
    for(let i=0; i<30; i++) {
      let colorClass = "bg-emerald-500";
      const rand = Math.random();
      
      if(i % 7 === 5 || i % 7 === 6) colorClass = "bg-muted"; 
      else if(rand > 0.9) colorClass = "bg-red-500"; 
      else if(rand > 0.8) colorClass = "bg-amber-400"; 

      grid.push(<div key={i} className={`h-4 w-4 rounded-full ${colorClass}`} title={colorClass.includes("emerald") ? "Present" : colorClass.includes("muted") ? "Weekend" : colorClass.includes("red") ? "Absent" : "Leave"} />);
    }
    return grid;
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground mt-1">Manage staff, track attendance, and oversee payroll.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search employees..." className="pl-8 bg-background" />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the personal details and role assignment for the new staff member.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input placeholder="e.g. Agent" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input placeholder="e.g. Customer Service" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Salary ($)</Label>
                    <Input placeholder="0.00" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Input placeholder="e.g. Active" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Save Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {HARDCODED_EMPLOYEES.map((employee) => (
          <Card key={employee.id} className="overflow-hidden flex flex-col group">
            <CardHeader className="pb-4 relative pt-8 flex items-center text-center border-b">
              <div className="absolute top-3 right-3">
                <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
              </div>
              <Avatar className="h-20 w-20 border-4 border-background shadow-sm mb-2">
                <AvatarFallback className={`${employee.color} text-white text-xl font-bold`}>
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{employee.name}</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                {getRoleBadge(employee.role)}
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-3 pb-4">
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium">{employee.department}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{employee.salary}</span>
              </div>
            </CardContent>
            <div className="p-4 bg-muted/20 border-t flex justify-center">
              <Button variant="outline" className="w-full" onClick={() => setSelectedEmployee(employee)}>
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        {selectedEmployee && (
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="mb-6 pt-4 text-left border-b pb-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 shadow-sm border">
                  <AvatarFallback className={`${selectedEmployee.color} text-white text-2xl font-bold`}>
                    {selectedEmployee.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-2xl">{selectedEmployee.name}</SheetTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleBadge(selectedEmployee.role)}
                    <Badge variant={selectedEmployee.status === "Active" ? "default" : "secondary"}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>
            
            <div className="space-y-8">
              {/* Performance & Info Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4" /> Performance Rating
                  </h4>
                  <div className="mt-1">
                    {renderStars(selectedEmployee.rating)}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Joined Date
                  </h4>
                  <p className="font-medium">{selectedEmployee.joined}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold mb-3">Contact Information</h4>
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                      <Mail className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary shrink-0">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{selectedEmployee.phone}</span>
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div>
                <h4 className="font-semibold mb-3">Monthly Compensation</h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Base Salary</TableCell>
                        <TableCell className="text-right font-medium">{selectedEmployee.salary}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Allowances (Transport/Food)</TableCell>
                        <TableCell className="text-right font-medium">+$450.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-muted-foreground">Deductions (Tax/Insurance)</TableCell>
                        <TableCell className="text-right font-medium text-red-500">-$320.00</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/30">
                        <TableCell className="font-bold">Net Payable</TableCell>
                        <TableCell className="text-right font-bold text-lg text-emerald-500">
                          {selectedEmployee.salary.replace("/mo", "")} {/* Mock display */}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Attendance Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Attendance Log</h4>
                  <span className="text-xs text-muted-foreground">Last 30 Days</span>
                </div>
                
                <div className="rounded-lg border bg-card p-5">
                  <div className="grid grid-cols-[repeat(6,minmax(0,1fr))] gap-3 justify-items-center sm:grid-cols-[repeat(10,minmax(0,1fr))]">
                    {generateAttendanceGrid()}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground justify-center border-t pt-4">
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-emerald-500" /> Present</div>
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500" /> Absent</div>
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-amber-400" /> Leave</div>
                    <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-muted border border-border" /> Weekend</div>
                  </div>
                </div>
              </div>

            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
