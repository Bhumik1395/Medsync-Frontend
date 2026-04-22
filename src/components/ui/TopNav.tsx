import { ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { Container } from "./Container";

type NavItem = {
  id: string;
  isActive?: boolean;
  label: string;
  onClick: () => void;
};

type TopNavProps = {
  navItems?: NavItem[];
  onNavigateAuth?: () => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  userLabel?: string;
};

export function TopNav({
  navItems,
  onLogout,
  onNavigateAuth,
  onNavigateHome,
  onSecondaryAction,
  primaryActionLabel = "Login",
  secondaryActionLabel = "Sign Up",
  userLabel
}: TopNavProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-app-border bg-white/90 backdrop-blur">
      <Container>
        <div className="flex min-h-20 flex-col justify-center gap-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-3 text-left" onClick={onNavigateHome} type="button">
              {navItems?.length ? (
                <p className="text-[2rem] font-bold tracking-tight-heading text-brand-blue">MedSync</p>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-white">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-brand-blue">MedSync</p>
                    <p className="text-sm text-app-text-secondary">Patient records, reports, and access control</p>
                  </div>
                </>
              )}
            </button>

            {navItems?.length ? (
              <nav className="flex items-center gap-6">
                {navItems.map((item) => (
                  <button
                    className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${
                      item.isActive
                        ? "border-brand-blue text-brand-blue"
                        : "border-transparent text-app-text-secondary hover:text-brand-blue"
                    }`}
                    key={item.id}
                    onClick={item.onClick}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            ) : null}
          </div>

          <nav className="flex items-center gap-3 self-end md:self-auto">
            {userLabel ? (
              <>
                {navItems?.length ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-app-text">{userLabel}</p>
                      <button
                        className="text-xs font-medium text-status-error transition-colors hover:underline"
                        onClick={onLogout}
                        type="button"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="hidden text-sm text-app-text-secondary md:inline">{userLabel}</span>
                    <Button onClick={onLogout} variant="secondary">
                      Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button onClick={onNavigateAuth} variant="secondary">
                  {primaryActionLabel}
                </Button>
                <Button onClick={onSecondaryAction}>{secondaryActionLabel}</Button>
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
