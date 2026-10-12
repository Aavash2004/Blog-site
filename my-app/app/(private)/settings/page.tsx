"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { fetchCurrentUser, logout, setCurrentUser, type StoredUser } from "@/app/lib/auth-client";
import { Toast, ToastViewport } from "@/components/ui/toast";
import {
  Lock,
  Trash2,
  AlertTriangle,
  X,
  EyeIcon,
  EyeOffIcon,
  Pencil,
  AtSign,
  Phone,
  MapPin,
  Camera,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

const contactSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username is too long.")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed."),
  phone: z
    .string()
    .trim()
    .length(10, "Phone number must be exactly 10 digits.")
    .regex(/^[0-9]+$/, "Phone number must contain numbers only."),
  address: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(255, "Address is too long.")
    .regex(/^[a-zA-Z\s,.'-]+$/, "Address can only contain letters and basic punctuation."),
});

export default function SettingsPage() {
  const router = useRouter();

  // Profile / contact info state
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [usernameError, setUsernameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [addressError, setAddressError] = useState<string | undefined>();
  const [savingContact, setSavingContact] = useState(false);

  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [savingPassword, setSavingPassword] = useState(false);

  // Shared / delete state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const validateContactField = (field: "username" | "phone" | "address", value: string) => {
    const fieldSchema = contactSchema.shape[field];
    const result = fieldSchema.safeParse(value);

    if (field === "username") {
      setUsernameError(result.success ? undefined : result.error.issues[0].message);
    } else if (field === "phone") {
      setPhoneError(result.success ? undefined : result.error.issues[0].message);
    } else if (field === "address") {
      setAddressError(result.success ? undefined : result.error.issues[0].message);
    }
  };

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) {
        setStoredUser(u);
        setUsername(u.username || "");
        setPhone(u.phone || "");
        setAddress(u.address || "");
      }
    });
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse({ username, phone, address });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setUsernameError(fieldErrors.username?.[0]);
      setPhoneError(fieldErrors.phone?.[0]);
      setAddressError(fieldErrors.address?.[0]);
      return;
    }
    setUsernameError(undefined);
    setPhoneError(undefined);
    setAddressError(undefined);
    setSavingContact(true);

    try {
      const response = await fetch("/api/me/contact", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: result.data.username,
          phone: result.data.phone || "",
          address: result.data.address || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to update details.", type: "error" });
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
        setStoredUser(data.user);
      }

      setToast({ message: "Details updated.", type: "success" });
      setEditingContact(false);
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    } finally {
      setSavingContact(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = passwordSchema.safeParse({ currentPassword, newPassword });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setCurrentPasswordError(fieldErrors.currentPassword?.[0]);
      setNewPasswordError(fieldErrors.newPassword?.[0]);
      return;
    }
    setCurrentPasswordError(undefined);
    setNewPasswordError(undefined);
    setSavingPassword(true);

    try {
      const response = await fetch("/api/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: result.data.currentPassword,
          newPassword: result.data.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to change password.", type: "error" });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setToast({ message: "Password changed.", type: "success" });
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/me/avatar", {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to upload photo.", type: "error" });
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
        setStoredUser(data.user);
      }

      setToast({ message: "Profile photo updated.", type: "success" });
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await fetch("/api/me", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setToast({ message: data.error || "Failed to delete account.", type: "error" });
        setDeleting(false);
        setShowDeleteDialog(false);
        return;
      }

      await logout();
      router.push("/");
      router.refresh();
    } catch {
      setToast({ message: "Unable to reach the server right now.", type: "error" });
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const initials =
    storedUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-10 sm:py-14">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Settings
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Account settings.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Manage your profile, password, and account preferences.
        </p>
      </div>

      {/* Avatar section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20 border border-zinc-200 dark:border-zinc-700">
            {storedUser?.avatar_url ? (
              <AvatarImage src={storedUser.avatar_url} alt={storedUser?.name ?? "Profile"} />
            ) : null}
            <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700/60 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <Camera className="h-4 w-4" />
              {uploadingAvatar ? "Uploading..." : "Change photo"}
            </button>
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">JPG, PNG, or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <AtSign className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Profile</h2>
          </div>
          <button
            type="button"
            onClick={() => setEditingContact(!editingContact)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={editingContact ? "Cancel editing" : "Edit profile"}
          >
            {editingContact ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
        </div>

        {/* Read-only name/email — never editable */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Full Name
            </label>
            <p className="rounded-xl border border-zinc-200 bg-zinc-100/50 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-500">
              {storedUser?.name || "—"}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Email
            </label>
            <p className="rounded-xl border border-zinc-200 bg-zinc-100/50 px-3 py-2.5 text-sm text-zinc-500 dark:border-zinc-700/60 dark:bg-zinc-900/40 dark:text-zinc-500">
              {storedUser?.email || "—"}
            </p>
          </div>
        </div>

        {editingContact ? (
          <form onSubmit={handleSaveContact} className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  validateContactField("username", e.target.value);
                }}
                onBlur={(e) => validateContactField("username", e.target.value)}
                placeholder="e.g. aavash_dev"
                disabled={savingContact}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              {usernameError ? <p className="mt-1 text-xs text-red-600">{usernameError}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  validateContactField("phone", e.target.value);
                }}
                onBlur={(e) => validateContactField("phone", e.target.value)}
                placeholder="1234567890"
                disabled={savingContact}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              {phoneError ? <p className="mt-1 text-xs text-red-600">{phoneError}</p> : null}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  validateContactField("address", e.target.value);
                }}
                onBlur={(e) => validateContactField("address", e.target.value)}
                placeholder="Street, City, Country"
                disabled={savingContact}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              {addressError ? <p className="mt-1 text-xs text-red-600">{addressError}</p> : null}
            </div>

            <button
              type="submit"
              disabled={savingContact}
              className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {savingContact ? "Saving..." : "Save changes"}
            </button>
          </form>
        ) : (
          <div className="grid gap-4 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <AtSign className="h-4 w-4 flex-shrink-0 text-zinc-400" />
              <span className="truncate">{username || "No username set"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Phone className="h-4 w-4 flex-shrink-0 text-zinc-400" />
              <span className="truncate">{phone || "No phone set"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <MapPin className="h-4 w-4 flex-shrink-0 text-zinc-400" />
              <span className="truncate">{address || "No address set"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Password section */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-950/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Lock className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError(undefined);
                }}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
              </button>
            </div>
            {currentPasswordError ? (
              <p className="mt-1 text-xs text-red-600">{currentPasswordError}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError(undefined);
                }}
                placeholder="••••••••"
                disabled={savingPassword}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 pr-10 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700/60 dark:bg-zinc-900/80 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
              </button>
            </div>
            {newPasswordError ? <p className="mt-1 text-xs text-red-600">{newPasswordError}</p> : null}
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Lock className="h-4 w-4" />
            {savingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-2xs dark:border-red-900/60 dark:bg-red-950/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Trash2 className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Account Deletion</h2>
        </div>
        <p className="mb-4 text-sm text-red-700/80 dark:text-red-400/80">
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteDialog(false)}
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"
          >
            <button
              type="button"
              onClick={() => !deleting && setShowDeleteDialog(false)}
              disabled={deleting}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 id="delete-dialog-title" className="text-lg font-bold text-zinc-950 dark:text-white">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              This action is permanent. All your data, including your profile and session history, will be
              deleted immediately and cannot be recovered.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700/60 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <ToastViewport>
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </ToastViewport>
      ) : null}
    </div>
  );
}