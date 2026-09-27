import { requireSession } from "@/lib/auth";
import AppShell from "./AppShell";

// Every page in this group requires a logged-in user.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <AppShell appName={process.env.NEXT_PUBLIC_APP_NAME || "Invoice Management"} username={session.username}>
      {children}
    </AppShell>
  );
}
