import { Button } from "../components/ui/Button";

type LandingPageProps = {
  onNavigateAuth: () => void;
  onNavigateHome: () => void;
  onNavigateSignup: () => void;
};

export function LandingPage({
  onNavigateAuth,
  onNavigateHome,
  onNavigateSignup
}: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#f9f9fc] font-['Inter',sans-serif] text-[#1a1c1e]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0px_4px_20px_rgba(0,61,92,0.08)]">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-8 py-4">
          <button
            className="font-['Poppins',sans-serif] text-2xl font-semibold tracking-tight text-[#003D5C]"
            onClick={onNavigateHome}
            type="button"
          >
            MedSync
          </button>

          <div className="flex items-center space-x-4">
            <Button
              className="rounded-lg border border-[#00263c] bg-transparent px-5 py-2 text-sm font-semibold text-[#00263c] shadow-none hover:bg-slate-50"
              onClick={onNavigateAuth}
              variant="secondary"
            >
              Login
            </Button>
            <Button
              className="rounded-lg bg-[#00263c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003d5c]"
              onClick={onNavigateSignup}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <section
        className="overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0, 61, 92, 0.05) 0%, rgba(255, 255, 255, 1) 100%)"
        }}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 px-8 py-20 lg:flex-row">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-100 bg-white px-4 py-2 shadow-sm">
              <span className="flex h-3 w-3 rounded-full bg-[#003D5C]" />
              <span className="font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-[0.2em] text-[#003D5C]">
                National Digital Health Mission
              </span>
            </div>

            <h1 className="max-w-2xl font-['Poppins',sans-serif] text-[32px] font-semibold leading-[1.2] text-[#00263c] md:text-[48px]">
              Your Healthcare Journey,
              <br />
              <span className="text-[#1e638f]">Unified and Secure.</span>
            </h1>

            <p className="max-w-lg text-[18px] leading-[1.6] text-[#41474d]">
              MedSync brings together your clinical history, insurance details, and care providers
              into one healthcare system designed for trust and clarity.
            </p>

            <div className="flex items-center gap-4">
              <Button
                className="rounded-lg bg-[#00263c] px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-[#003d5c]"
                onClick={onNavigateSignup}
              >
                Get Started
              </Button>
              <Button
                className="rounded-lg border border-[#72787e] bg-transparent px-8 py-4 text-sm font-semibold text-[#00263c] shadow-none hover:bg-slate-100"
                onClick={onNavigateAuth}
                variant="secondary"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className="relative flex-1">
            <div className="relative z-10 h-[500px] w-full overflow-hidden rounded-2xl shadow-[0px_20px_50px_rgba(0,61,92,0.15)]">
              <img
                alt="Modern hospital facility"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSvvyIYoeXaiLz0SsFHRRPVx-cS2KS5-2nZ5YPvO-59LVw9Jrx1l4r0VyNLqGBZ6NobirlMHrafog276T6P_7HxcLezDQB9ypLf0oyLCzCE8stXNhqZtCSYOo6tILPweETkj7hs-QhLZWRFh7n8olACM4iCLn7eYdfkEDlBA41lsJ5ib7eWA9EUpcARsipmirFbaXo5sptvcbMXk_ZjeQ1T7lpqkRhYYKxwifrqoJoMxQytb6LeSWQ4A_sSOrysv2683QvWu268Q"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1280px] px-8">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="font-['Poppins',sans-serif] text-[28px] font-semibold leading-[1.2] text-[#00263c]">
              Care Map
            </h2>
            <p className="max-w-2xl text-[16px] leading-[1.6] text-[#41474d]">
              This section is ready for Google Places API integration so you can show nearby hospitals, clinics, and diagnostics centers.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-[0px_12px_32px_rgba(0,61,92,0.08)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-[#00263c]">Google Places Map</p>
                <p className="text-xs text-slate-500">Replace this container with your map script and search results.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                API Ready
              </div>
            </div>

            <div
              className="flex h-[420px] items-center justify-center bg-[linear-gradient(180deg,#eef5fb_0%,#f8fafc_100%)] text-center"
              id="google-places-map"
            >
              <div className="max-w-md px-6">
                <p className="font-['Poppins',sans-serif] text-[24px] font-semibold text-[#00263c]">
                  Map Container
                </p>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#41474d]">
                  Load Google Maps here and use Places search to show nearby healthcare facilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 px-8 md:flex-row">
          <div className="font-['Poppins',sans-serif] text-xl font-semibold tracking-tight text-[#003D5C]">
            MedSync
          </div>
          <p className="text-[14px] leading-[1.5] text-slate-500">
            © 2024 MedSync Healthcare Systems. Verified NDHM Partner.
          </p>
          <div className="flex gap-8 text-[14px] font-medium text-slate-600">
            <a className="hover:text-[#00263c]" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-[#00263c]" href="#">
              Terms of Service
            </a>
            <a className="hover:text-[#00263c]" href="#">
              Security
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
