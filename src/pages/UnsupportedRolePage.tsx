import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Container } from "../components/ui/Container";
import { TopNav } from "../components/ui/TopNav";
import type { User } from "../types/app";

type UnsupportedRolePageProps = {
  onLogout: () => void;
  onNavigateHome: () => void;
  user: User;
};

export function UnsupportedRolePage({
  onLogout,
  onNavigateHome,
  user
}: UnsupportedRolePageProps) {
  return (
    <main className="min-h-screen bg-app-bg text-app-text">
      <TopNav onLogout={onLogout} onNavigateHome={onNavigateHome} userLabel={`${user.name} - ${user.role}`} />
      <Container>
        <section className="py-8">
          <Card className="rounded-3xl p-8">
            <Badge variant="success">Role page pending</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight-heading text-brand-blue md:text-4xl">
              This role is supported by the backend but not separated in the frontend yet.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-copy text-app-text-secondary">
              Patient, hospital, and insurance pages have been separated. This account can sign in,
              but its dedicated frontend page is not part of the current split.
            </p>
          </Card>
        </section>
      </Container>
    </main>
  );
}
