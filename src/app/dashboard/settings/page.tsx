"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Building2, User, Bell, DollarSign, Palette, Link as LinkIcon, UploadCloud, CheckCircle2, Sun, Moon, Monitor, CreditCard, MessageSquare, MapPin, Calculator } from "lucide-react";

// Custom Switch component to avoid missing shadcn dependency
const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-primary" : "bg-input"}`}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

const PRICING_RULES = [
  { category: "Economy", base: 35, weekend: 45, discount: 5 },
  { category: "Standard", base: 55, weekend: 70, discount: 10 },
  { category: "SUV", base: 85, weekend: 110, discount: 15 },
  { category: "Luxury", base: 150, weekend: 200, discount: 20 },
  { category: "Van / Minivan", base: 95, weekend: 120, discount: 10 },
];

const INTEGRATIONS = [
  { id: "stripe", name: "Stripe Payment Gateway", desc: "Process credit card payments securely for bookings.", icon: CreditCard, connected: true },
  { id: "twilio", name: "Twilio SMS", desc: "Automated SMS alerts for booking confirmations and reminders.", icon: MessageSquare, connected: true },
  { id: "gps", name: "TrackIt Fleet GPS", desc: "Live vehicle location and mileage tracking integration.", icon: MapPin, connected: false },
  { id: "xero", name: "Xero Accounting", desc: "Sync invoices, payments, and financial logs automatically.", icon: Calculator, connected: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Company Profile");
  const [theme, setTheme] = useState("System");
  const [alerts, setAlerts] = useState({
    lateReturn: true,
    insurance: true,
    maintenance: true,
    newBooking: false,
    dailyReport: true
  });

  const TABS = [
    { id: "Company Profile", icon: Building2 },
    { id: "User Profile", icon: User },
    { id: "Notifications", icon: Bell },
    { id: "Pricing Rules", icon: DollarSign },
    { id: "Theme", icon: Palette },
    { id: "Integrations", icon: LinkIcon },
  ];

  return (
    <div className="flex-1 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1">Settings</h2>
        <p className="text-muted-foreground mb-6">Manage your system preferences, company details, and integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Vertical Tab List */}
        <Card className="w-full md:w-64 shrink-0 overflow-hidden">
          <div className="flex flex-row md:flex-col p-2 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap md:whitespace-normal w-full text-left ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {tab.id}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Content Panel */}
        <div className="flex-1 w-full min-w-0">
          
          {/* Company Profile */}
          {activeTab === "Company Profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Update your business details and regional settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-3">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                      <Building2 className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <Button variant="outline" className="gap-2"><UploadCloud className="w-4 h-4" /> Upload New Logo</Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="RentFlow Premium Auto" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue="contact@rentflow.com" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Address</Label>
                    <Input defaultValue="123 Luxury Lane, Business District" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 border-t pt-6">
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">Eastern Time (ET)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-muted/20">
                <Button>Save Company Settings</Button>
              </CardFooter>
            </Card>
          )}

          {/* User Profile */}
          {activeTab === "User Profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your admin account details and security.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-col space-y-3">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border bg-primary/10 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                      <span className="text-2xl font-bold text-primary">JD</span>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Click avatar to upload new image.</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue="john.admin@rentflow.com" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue="Super Administrator" readOnly className="bg-muted text-muted-foreground" />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold text-sm">Change Password</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2 md:col-span-1">
                      <Label>Current Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="hidden md:block" />
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-muted/20">
                <Button>Save Profile Changes</Button>
              </CardFooter>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === "Notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure which system alerts you receive via email/dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Late Return Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications when a vehicle is not returned on time.</p>
                  </div>
                  <Switch checked={alerts.lateReturn} onCheckedChange={(c) => setAlerts({...alerts, lateReturn: c})} />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Insurance Expiry Warnings</Label>
                    <p className="text-sm text-muted-foreground">Get alerted 14 days before any vehicle policy expires.</p>
                  </div>
                  <Switch checked={alerts.insurance} onCheckedChange={(c) => setAlerts({...alerts, insurance: c})} />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Due Reminders</Label>
                    <p className="text-sm text-muted-foreground">Notifications for upcoming scheduled service dates.</p>
                  </div>
                  <Switch checked={alerts.maintenance} onCheckedChange={(c) => setAlerts({...alerts, maintenance: c})} />
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Booking Created</Label>
                    <p className="text-sm text-muted-foreground">Alert every time a new reservation is processed.</p>
                  </div>
                  <Switch checked={alerts.newBooking} onCheckedChange={(c) => setAlerts({...alerts, newBooking: c})} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Daily Report Email</Label>
                    <p className="text-sm text-muted-foreground">Receive a summary of revenue, active rentals, and pending tasks.</p>
                  </div>
                  <Switch checked={alerts.dailyReport} onCheckedChange={(c) => setAlerts({...alerts, dailyReport: c})} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Rules */}
          {activeTab === "Pricing Rules" && (
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Pricing Rules</CardTitle>
                <CardDescription>Set base rates, weekend multipliers, and long-term discounts by category.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Vehicle Category</TableHead>
                        <TableHead>Base Price / Day ($)</TableHead>
                        <TableHead>Weekend Rate ($)</TableHead>
                        <TableHead>Long-term Discount (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PRICING_RULES.map((rule, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{rule.category}</TableCell>
                          <TableCell>
                            <Input type="number" defaultValue={rule.base} className="w-24" />
                          </TableCell>
                          <TableCell>
                            <Input type="number" defaultValue={rule.weekend} className="w-24" />
                          </TableCell>
                          <TableCell>
                            <div className="relative w-24">
                              <Input type="number" defaultValue={rule.discount} className="pr-6" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-muted/20">
                <Button>Update Pricing Matrix</Button>
              </CardFooter>
            </Card>
          )}

          {/* Theme */}
          {activeTab === "Theme" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setTheme("Light")}
                    className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center gap-3 transition-colors ${theme === "Light" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}
                  >
                    <div className="p-3 bg-background border shadow-sm rounded-full">
                      <Sun className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="font-medium">Light Mode</span>
                  </div>

                  <div 
                    onClick={() => setTheme("Dark")}
                    className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center gap-3 transition-colors ${theme === "Dark" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}
                  >
                    <div className="p-3 bg-zinc-950 border shadow-sm rounded-full">
                      <Moon className="w-6 h-6 text-slate-200" />
                    </div>
                    <span className="font-medium">Dark Mode</span>
                  </div>

                  <div 
                    onClick={() => setTheme("System")}
                    className={`cursor-pointer rounded-lg border-2 p-6 flex flex-col items-center gap-3 transition-colors ${theme === "System" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}`}
                  >
                    <div className="p-3 bg-muted border shadow-sm rounded-full">
                      <Monitor className="w-6 h-6 text-foreground" />
                    </div>
                    <span className="font-medium">System Default</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {activeTab === "Integrations" && (
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Integrations</CardTitle>
                <CardDescription>Connect external services to enhance system capabilities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {INTEGRATIONS.map((int) => {
                    const Icon = int.icon;
                    return (
                      <div key={int.id} className="border rounded-lg p-5 flex flex-col relative">
                        {int.connected && (
                          <div className="absolute top-4 right-4 text-emerald-500 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </div>
                        )}
                        <div className="p-3 bg-muted w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-foreground" />
                        </div>
                        <h4 className="font-bold mb-1">{int.name}</h4>
                        <p className="text-sm text-muted-foreground flex-1 mb-6">{int.desc}</p>
                        
                        <Button variant={int.connected ? "outline" : "default"} className={int.connected ? "text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" : ""}>
                          {int.connected ? "Disconnect" : "Connect Setup"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
