import { toaster } from "@/components/ui/toaster";

export type ToastLevel = "success" | "info" | "warning" | "error" | "loading";

export type ToastPayload = {
  title?: string;
  description?: string;
  type?: ToastLevel;
  duration?: number;
  closable?: boolean;
};

export const toastBus = {
  show: (p: ToastPayload) =>
    toaster.create({
      ...p,
      duration: p.duration ?? 3000,
      closable: p.closable ?? true,
    }),
  success: (title: string, description?: string) =>
    toaster.success({ title, description }),
  info: (title: string, description?: string) =>
    toaster.create({ title, description, type: "info" }),
  warning: (title: string, description?: string) =>
    toaster.create({ title, description, type: "warning" }),
  error: (title: string, description?: string) =>
    toaster.error({ title, description }),
  loading: (title: string, description?: string) =>
    toaster.create({ title, description, type: "loading", duration: 4000 }),
  dismissAll: () => toaster.dismiss(),
};