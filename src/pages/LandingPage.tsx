import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { env } from "../config/env";

type LandingPageProps = {
  onNavigateAuth: () => void;
  onNavigateHome: () => void;
  onNavigateSignup: () => void;
};

type NearbyHospital = {
  address: string;
  distance: number | null;
  id: string;
  lat: number;
  lon: number;
  name: string;
};

type UserCoordinates = {
  lat: number;
  lon: number;
};

type GeoapifyPlace = {
  properties?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    distance?: number;
    formatted?: string;
    lat?: number;
    lon?: number;
    name?: string;
    place_id?: string;
  };
};

function formatDistance(distance: number | null) {
  if (distance === null) {
    return "Distance unavailable";
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m away`;
  }

  return `${(distance / 1000).toFixed(1)} km away`;
}

function getHospitalAddress(place: GeoapifyPlace) {
  const { address_line1, address_line2, city, formatted } = place.properties || {};
  return address_line1 || address_line2 || formatted || city || "Address unavailable";
}

export function LandingPage({
  onNavigateAuth,
  onNavigateHome,
  onNavigateSignup
}: LandingPageProps) {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [locationError, setLocationError] = useState("");
  const [locationStatus, setLocationStatus] = useState("Enable location access to find hospitals within 2 km.");
  const [searchingHospitals, setSearchingHospitals] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(null);

  const staticMapUrl = useMemo(() => {
    if (!env.geoapifyApiKey || !userCoordinates) {
      return "";
    }

    const visibleHospitals = hospitals.slice(0, 8);
    const markerEntries = [
      `lonlat:${userCoordinates.lon},${userCoordinates.lat};type:material;color:%2300263c;icon:user;icontype:material;text:You;whitecircle:no`,
      ...visibleHospitals.map(
        (hospital, index) =>
          `lonlat:${hospital.lon},${hospital.lat};type:material;color:%231e638f;icon:hospital;icontype:material;text:${index + 1};whitecircle:no`
      )
    ];

    const params = new URLSearchParams({
      apiKey: env.geoapifyApiKey,
      format: "png",
      height: "420",
      marker: markerEntries.join("|"),
      scaleFactor: "2",
      style: "osm-bright",
      width: "1200",
      zoom: visibleHospitals.length ? "14" : "15"
    });

    params.set("center", `lonlat:${userCoordinates.lon},${userCoordinates.lat}`);

    return `https://maps.geoapify.com/v1/staticmap?${params.toString()}`;
  }, [hospitals, userCoordinates]);

  async function loadNearbyHospitals(latitude: number, longitude: number) {
    if (!env.geoapifyApiKey) {
      throw new Error("Geoapify API key is missing. Add VITE_GEOAPIFY_API_KEY to your environment.");
    }

    const params = new URLSearchParams({
      apiKey: env.geoapifyApiKey,
      bias: `proximity:${longitude},${latitude}`,
      categories: "healthcare.hospital",
      filter: `circle:${longitude},${latitude},2000`,
      limit: "8"
    });

    const response = await fetch(`https://api.geoapify.com/v2/places?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Could not load nearby hospitals right now.");
    }

    const payload = await response.json();
    const results = Array.isArray(payload.features) ? payload.features : [];

    return results.map((place: GeoapifyPlace, index: number) => ({
      address: getHospitalAddress(place),
      distance: place.properties?.distance ?? null,
      id: place.properties?.place_id || `${place.properties?.name || "hospital"}-${index}`,
      lat: place.properties?.lat ?? latitude,
      lon: place.properties?.lon ?? longitude,
      name: place.properties?.name || "Nearby hospital"
    }));
  }

  function handleFindNearbyHospitals() {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setSearchingHospitals(true);
    setLocationError("");
    setLocationStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setUserCoordinates({
            lat: coords.latitude,
            lon: coords.longitude
          });
          setLocationStatus("Searching for hospitals near you...");
          const results = await loadNearbyHospitals(coords.latitude, coords.longitude);
          setHospitals(results);
          setLocationStatus(
            results.length
              ? `Showing hospitals found within 2 km of your current location.`
              : "No hospitals were found within 2 km of your current location."
          );
        } catch (error) {
          setHospitals([]);
          setUserCoordinates(null);
          setLocationError(error instanceof Error ? error.message : "Could not find nearby hospitals.");
          setLocationStatus("Try again in a moment.");
        } finally {
          setSearchingHospitals(false);
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Please allow location access to search nearby hospitals."
            : "Could not access your location.";

        setHospitals([]);
        setUserCoordinates(null);
        setLocationError(message);
        setLocationStatus("Location is required to search nearby hospitals.");
        setSearchingHospitals(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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
              Nearby Hospitals
            </h2>
            <p className="max-w-2xl text-[16px] leading-[1.6] text-[#41474d]">
              Allow location access to find hospitals within a 2 km radius of your current location.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-[0px_12px_32px_rgba(0,61,92,0.08)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-[#00263c]">Geoapify Places Search</p>
                <p className="mt-1 text-sm text-slate-500">{locationStatus}</p>
              </div>
              <Button
                className="rounded-lg bg-[#00263c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#003d5c]"
                onClick={handleFindNearbyHospitals}
              >
                {searchingHospitals ? "Finding Hospitals..." : "Use My Location"}
              </Button>
            </div>

            {locationError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {locationError}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-2">
                {staticMapUrl ? (
                  <>
                    <img
                      alt="Map showing your location and nearby hospitals"
                      className="h-[420px] w-full object-cover"
                      src={staticMapUrl}
                    />
                    <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
                      <p>Your location is marked as "You". Nearby hospitals are numbered on the map.</p>
                      <p>
                        Powered by Geoapify, © OpenStreetMap contributors
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-[420px] items-center justify-center bg-[linear-gradient(180deg,#eef5fb_0%,#f8fafc_100%)] px-6 text-center text-slate-500">
                    A hospital map will appear here after location access is granted.
                  </div>
                )}
              </div>

              {hospitals.length ? (
                hospitals.map((hospital) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    key={hospital.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-['Poppins',sans-serif] text-xl font-semibold text-[#00263c]">
                          {hospital.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{hospital.address}</p>
                      </div>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#003D5C]">
                        {formatDistance(hospital.distance)}
                      </span>
                    </div>
                    <a
                      className="mt-4 inline-flex text-sm font-semibold text-[#1e638f] hover:text-[#003D5C]"
                      href={`https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}#map=16/${hospital.lat}/${hospital.lon}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View on map
                    </a>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-500 md:col-span-2">
                  Nearby hospitals will appear here after location access is granted.
                </div>
              )}
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
