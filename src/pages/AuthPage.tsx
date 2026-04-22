import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Toast } from "../components/ui/Toast";

type AuthPageProps = {
  authError: string;
  authLoading: boolean;
  authMode: "login" | "register";
  email: string;
  name: string;
  onAuthModeChange: (mode: "login" | "register") => void;
  onEmailChange: (value: string) => void;
  onNavigateAuth: () => void;
  onNavigateHome: () => void;
  onNavigateSignup: () => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  password: string;
  registerRole: "patient" | "hospital" | "insurance";
  onRegisterRoleChange: (value: "patient" | "hospital" | "insurance") => void;
};

export function AuthPage({
  authError,
  authLoading,
  authMode,
  email,
  name,
  onAuthModeChange,
  onEmailChange,
  onNavigateAuth,
  onNavigateHome,
  onNavigateSignup,
  onNameChange,
  onPasswordChange,
  onSubmit,
  password,
  registerRole,
  onRegisterRoleChange
}: AuthPageProps) {
  return (
    <main className="min-h-screen bg-[#f8f9fa] font-['Manrope',sans-serif] text-[#191c1d]">
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: "#f8f9fa",
          backgroundImage:
            "linear-gradient(to right, rgba(150,179,147,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(150,179,147,0.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <header className="fixed top-0 z-50 w-full bg-transparent">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
          <button
            className="text-left text-xl font-extrabold tracking-tight text-slate-900"
            onClick={onNavigateHome}
            type="button"
          >
            MedSync
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            <a className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900" href="#">
              Help
            </a>
            <a className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900" href="#">
              Support
            </a>
            <a className="text-sm font-medium text-slate-900 transition-colors hover:text-slate-900" href="#">
              Language
            </a>
          </nav>
        </div>
      </header>

      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-24">
          <div className="w-full max-w-[440px] overflow-hidden rounded-xl border border-white/70 bg-white shadow-[0_10px_40px_-10px_rgba(45,106,106,0.12)]">
            <div className="space-y-8 p-10">
              <div className="flex rounded-lg bg-[#edeeef] p-1">
                <button
                  className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition-all ${
                    authMode === "login"
                      ? "bg-white text-[#191c1d] shadow-sm"
                      : "text-[#44474a] hover:text-[#191c1d]"
                  }`}
                  onClick={() => onAuthModeChange("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition-all ${
                    authMode === "register"
                      ? "bg-white text-[#191c1d] shadow-sm"
                      : "text-[#44474a] hover:text-[#191c1d]"
                  }`}
                  onClick={() => onAuthModeChange("register")}
                  type="button"
                >
                  Sign Up
                </button>
              </div>

              <form className="space-y-6" onSubmit={onSubmit}>
                {authMode === "register" ? (
                  <>
                    <Input
                      className="h-12 rounded-lg border-[#c5c6ca] bg-transparent focus:border-[#2D6A6A] focus:ring-0"
                      id="name"
                      label="Full name"
                      onChange={(event) => onNameChange(event.target.value)}
                      value={name}
                    />
                    <Select
                      className="h-12 rounded-lg border-[#c5c6ca] bg-transparent focus:border-[#2D6A6A] focus:ring-0"
                      id="role"
                      label="Account type"
                      onChange={(event) =>
                        onRegisterRoleChange(event.target.value as "patient" | "hospital" | "insurance")
                      }
                      value={registerRole}
                    >
                      <option value="patient">Patient</option>
                      <option value="hospital">Hospital</option>
                      <option value="insurance">Insurance</option>
                    </Select>
                  </>
                ) : null}

                <Input
                  className="h-12 rounded-lg border-[#c5c6ca] bg-transparent focus:border-[#2D6A6A] focus:ring-0"
                  id="email"
                  label="Email"
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-semibold text-[#44474a]" htmlFor="password">
                      Password
                    </label>
                    <a className="text-xs text-[#44474a] transition-colors hover:text-[#2D6A6A]" href="#">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    className="h-12 w-full rounded-lg border border-[#c5c6ca] bg-transparent px-4 text-sm text-[#191c1d] outline-none transition-all placeholder:text-[#44474a]/40 focus:border-[#2D6A6A]"
                    id="password"
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="••••••••"
                    type="password"
                    value={password}
                  />
                </div>

                {authError ? <Toast message={authError} title="Authentication error" variant="error" /> : null}

                <Button
                  className="h-12 w-full justify-center rounded-lg bg-[#2D6A6A] text-sm font-semibold text-white hover:bg-[#255858]"
                  disabled={authLoading}
                  type="submit"
                >
                  {authLoading ? "Please wait..." : authMode === "login" ? "Log In" : "Create account"}
                </Button>
              </form>
            </div>

            <div className="border-t border-[#c5c6ca]/30 bg-[#f3f4f5] px-10 py-6 text-center">
              <p className="text-sm text-[#44474a]">
                {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  className="font-semibold text-[#2D6A6A] hover:underline"
                  onClick={() => onAuthModeChange(authMode === "login" ? "register" : "login")}
                  type="button"
                >
                  {authMode === "login" ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-auto flex flex-col items-center justify-between border-t border-slate-200/50 bg-transparent px-8 py-8 md:flex-row">
          <p className="mb-4 text-xs text-slate-400 md:mb-0">© 2024 MedSync. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-xs text-slate-400 transition-colors hover:text-slate-600" href="#">
              Privacy Policy
            </a>
            <a className="text-xs text-slate-400 transition-colors hover:text-slate-600" href="#">
              Terms of Service
            </a>
            <a className="text-xs text-slate-400 transition-colors hover:text-slate-600" href="#">
              Cookie Policy
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
