import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import MainPage from './pages/MainPage';
import AdminFingeringConfig from './pages/AdminFingeringConfig';

// Root layout
function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
      <footer className="fixed bottom-0 right-0 px-3 py-1 text-xs text-muted-foreground font-lora opacity-60 hover:opacity-100 transition-opacity z-50 pointer-events-auto">
        Built with ♥ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'ocarina-music-app')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
        {' '}· © {new Date().getFullYear()}
      </footer>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminFingeringConfig,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
