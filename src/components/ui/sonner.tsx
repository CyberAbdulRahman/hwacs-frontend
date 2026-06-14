"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#0f172a",
          "--normal-border": "#bfdbfe",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "bg-white text-slate-900 border border-blue-200 shadow-lg",
          title: "text-slate-900 font-semibold",
          description: "text-slate-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
