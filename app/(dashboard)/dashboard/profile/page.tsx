"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { authApi, getApiErrorMessage, userApi } from "@/lib/api";

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [profileOverride, setProfileOverride] = useState<ProfileFormState | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: userApi.getProfile,
  });

  const profileForm = useMemo(
    () =>
      profileOverride ?? {
      name: profileQuery.data?.name || "",
      email: profileQuery.data?.email || "",
      phone: profileQuery.data?.phone || "",
      address: profileQuery.data?.address || "",
      gender: profileQuery.data?.gender || "",
      },
    [profileOverride, profileQuery.data],
  );

  const updateMutation = useMutation({
    mutationFn: userApi.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated.");
      setProfileOverride(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success("Password changed.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Profile Settings"
        description="Update admin profile data and change your password."
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={profileForm.name}
                onChange={(event) =>
                  setProfileOverride((prev) => ({
                    ...(prev ?? profileForm),
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileOverride((prev) => ({
                    ...(prev ?? profileForm),
                    email: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profileForm.phone}
                onChange={(event) =>
                  setProfileOverride((prev) => ({
                    ...(prev ?? profileForm),
                    phone: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={profileForm.gender}
                onChange={(event) =>
                  setProfileOverride((prev) => ({
                    ...(prev ?? profileForm),
                    gender: event.target.value,
                  }))
                }
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input
                value={profileForm.address}
                onChange={(event) =>
                  setProfileOverride((prev) => ({
                    ...(prev ?? profileForm),
                    address: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => updateMutation.mutate(profileForm)}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Old Password</Label>
              <Input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={changePasswordMutation.isPending}
              onClick={() => {
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  toast.error("New password and confirmation do not match.");
                  return;
                }

                changePasswordMutation.mutate({
                  oldPassword: passwordForm.oldPassword,
                  newPassword: passwordForm.newPassword,
                });
              }}
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
