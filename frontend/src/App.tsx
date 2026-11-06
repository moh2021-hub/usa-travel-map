import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthDialog } from "./components/AuthDialog";
import { Header } from "./components/Header";
import { loadFromAccount } from "./lib/sync";
import SharePage from "./pages/SharePage";
import StatePage from "./pages/StatePage";
import UsPage from "./pages/UsPage";

// The world map file is large, so it is only downloaded when someone opens that page.
const WorldPage = lazy(() => import("./pages/WorldPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    // City lists never change while the app is open, so fetch each one once.
    queries: { staleTime: Infinity, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  useEffect(() => {
    loadFromAccount();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Header />
        <Suspense fallback={<p className="mx-auto max-w-7xl px-4 py-6 text-lg">Loading the map…</p>}>
          <Routes>
            <Route path="/" element={<UsPage />} />
            <Route path="/state/:code" element={<StatePage />} />
            <Route path="/world" element={<WorldPage />} />
            <Route path="/share/:slug" element={<SharePage />} />
            <Route path="*" element={<UsPage />} />
          </Routes>
        </Suspense>
        <footer className="mx-auto max-w-7xl px-4 pb-8 pt-4 text-sm text-gravel">
          City data from <a href="https://www.geonames.org/" className="text-sign">GeoNames</a> (CC BY 4.0). Map
          shapes from the US Census Bureau and Natural Earth.
        </footer>
        <AuthDialog />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
