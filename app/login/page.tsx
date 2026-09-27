import LoginForm from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return <LoginForm appName={process.env.NEXT_PUBLIC_APP_NAME || "Invoice Management"} from={from ?? "/invoices"} />;
}
