import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Limelight",
  description: "Sign in to your Limelight account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
