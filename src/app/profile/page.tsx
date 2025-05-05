'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Grid, GridItem } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { User, Key, AlertTriangle, Loader2, Lock, UserCog, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data: {newPassword: string, confirmPassword: string}) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  studyReminders: z.boolean(),
});

export default function Profile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: true,
      studyReminders: true,
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  useEffect(() => {
    if (userData) {
      profileForm.reset({
        name: userData.name,
        email: userData.email,
      });
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserData(data.user);
      } else {
        console.error('Error fetching user data:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Password updated successfully");
        setPasswordModalOpen(false);
        passwordForm.reset();
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred while updating your password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Profile updated successfully");
        setProfileModalOpen(false);
        await update({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
            email: values.email,
          }
        });
        
        if (userData) {
          setUserData({
            ...userData,
            name: values.name,
            email: values.email,
          });
        }
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPreferencesSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Preferences updated successfully");
        setPreferencesModalOpen(false);
      } else {
        toast.error(data.message || "Failed to update preferences");
      }
    } catch (error) {
      toast.error("An error occurred while updating your preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteAccount = async () => {
    if (confirmDelete !== 'DELETE') {
      toast.error("Please type DELETE to confirm account deletion");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Account deleted successfully");
        router.push('/auth/signin');
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("An error occurred while deleting your account");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white mt-20">
        <div className="container mx-auto px-4 pt-8 pb-16">
          <Grid noBorder="bottom">
            <GridItem className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-blue-900 animate-spin mb-4" />
              <p className="text-gray-600">Loading your profile...</p>
            </GridItem>
          </Grid>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; 
  }

  const firstLetter = session.user.name?.charAt(0).toUpperCase() || '?';
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white mt-20">
      <div className="container mx-auto px-4 pt-8 pb-16">
        <Grid noBorder="bottom">
          <GridItem>
            <h1 className="text-3xl font-bold mb-1 text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mb-8">Manage your account details and settings</p>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-12">
              <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center text-white">
                <span className="text-3xl font-bold">{firstLetter}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session.user.name}</h2>
                <p className="text-gray-600 mb-2">{session.user.email}</p>
                <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded-full font-medium">
                  {session.user.role === 'admin' ? 'Administrator' : 'Student'}
                </span>
              </div>
            </div>
          </GridItem>
        </Grid>
        <Grid columns={2} connectTo="top">
          <GridItem>
            <div className="flex items-center mb-6">
              <User className="h-5 w-5 text-blue-900 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Account Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-gray-900 font-medium">{session.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-900 font-medium">{session.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account ID</p>
                <p className="font-mono text-sm text-gray-600">{session.user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="text-gray-900 font-medium">{userData?.createdAt ? formatDate(userData.createdAt) : 'Loading...'}</p>
              </div>
            </div>
          </GridItem>
          <GridItem>
            <div className="flex items-center mb-6">
              <Key className="h-5 w-5 text-blue-900 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Account Management</h3>
            </div>
            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                <div className="flex items-start mb-3">
                  <Lock className="h-5 w-5 text-blue-700 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Security</h4>
                    <p className="text-sm text-blue-700 mb-3">Update your password to keep your account secure</p>
                    <Button
                      variant="outline"
                      className="bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 font-medium"
                      onClick={() => setPasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50">
                <div className="flex items-start mb-3">
                  <UserCog className="h-5 w-5 text-emerald-700 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-emerald-900">Profile Settings</h4>
                    <p className="text-sm text-emerald-700 mb-3">Keep your profile information up to date</p>
                    <Button
                      variant="outline"
                      className="bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 font-medium"
                      onClick={() => setProfileModalOpen(true)}
                    >
                      Update Profile Information
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start mb-3">
                  <Settings className="h-5 w-5 text-slate-700 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Preferences</h4>
                    <p className="text-sm text-slate-700 mb-3">Customize your experience</p>
                    <Button
                      variant="outline"
                      className="bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-800 font-medium"
                      onClick={() => setPreferencesModalOpen(true)}
                    >
                      Manage Preferences
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 rounded-lg border border-red-100 bg-red-50">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-semibold text-red-900">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-3">Delete your account and all associated data</p>
                    <Button
                      variant="outline"
                      className="bg-white text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 font-medium"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </div>
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password to keep your account secure.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Keep your profile information up to date.
            </DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setProfileModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={preferencesModalOpen} onOpenChange={setPreferencesModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Preferences</DialogTitle>
            <DialogDescription>
              Customize your experience.
            </DialogDescription>
          </DialogHeader>
          <Form {...preferencesForm}>
            <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-4">
              <FormField
                control={preferencesForm.control}
                name="emailNotifications"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Email Notifications</FormLabel>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your account and new features
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={preferencesForm.control}
                name="studyReminders"
                render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Study Reminders</FormLabel>
                      <p className="text-sm text-gray-500">
                        Get reminders about upcoming study sessions and deadlines
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPreferencesModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="font-medium">Warning:</span>
              </div>
              <p className="ml-6">
                Deleting your account will remove all your data, including study history, saved tests, and personal information.
              </p>
            </div>
            <div>
              <Label htmlFor="confirm-delete" className="text-sm font-medium">
                Type DELETE to confirm
              </Label>
              <Input
                id="confirm-delete"
                className="mt-1"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setDeleteModalOpen(false);
                  setConfirmDelete("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={onDeleteAccount}
                disabled={isSubmitting || confirmDelete !== 'DELETE'}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 