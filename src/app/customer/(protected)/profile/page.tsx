"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (data) {
          setProfile(data);
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    
    // Update customers table
    const { error: dbError } = await supabase
      .from('customers')
      .update({ full_name: fullName, phone: phone })
      .eq('id', profile.id);
      
    // Update user_profiles table as well
    await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);
      
    // Update password if provided
    if (password) {
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        setMessage("Error updating password: " + authError.message);
        setIsSaving(false);
        return;
      }
      setPassword(""); // clear input
    }
    
    if (dbError) {
      setMessage("Error updating profile.");
    } else {
      setMessage("Profile updated successfully!");
    }
    
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled className="bg-muted" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          
          <div className="pt-4 mt-4 border-t">
            <h3 className="font-semibold mb-4">Change Password</h3>
            <div className="grid gap-2">
              <Label htmlFor="password">New Password (leave blank to keep current)</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" 
              />
            </div>
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('Error') ? 'text-destructive' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          
          <Button className="mt-4 w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
