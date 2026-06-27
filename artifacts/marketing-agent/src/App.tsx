import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { Landing } from "@/pages/landing";
import { Dashboard } from "@/pages/dashboard";
import { GmbTrack } from "@/pages/gmb";
import { ReviewTrack } from "@/pages/review";
import { SocialTrack } from "@/pages/social";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(186, 60%, 20%)",
    colorForeground: "hsl(195, 50%, 10%)",
    colorMutedForeground: "hsl(195, 15%, 45%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(195, 20%, 98%)",
    colorInput: "hsl(195, 15%, 97%)",
    colorInputForeground: "hsl(195, 50%, 10%)",
    colorNeutral: "hsl(195, 15%, 80%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-slate-200",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-teal-700 font-semibold hover:text-teal-800",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-400",
    identityPreviewEditButton: "text-teal-700",
    formFieldSuccessText: "text-teal-700",
    alertText: "text-slate-700",
    logoBox: "flex justify-center",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-slate-200 bg-white hover:bg-slate-50",
    formButtonPrimary: "bg-teal-800 hover:bg-teal-900 text-white font-semibold",
    formFieldInput: "border-slate-200 bg-white text-slate-900 focus:ring-teal-700",
    footerAction: "bg-slate-50",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-slate-200",
  },
};

function SignInPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const redirectUrl = params.get("redirect_url") || `${basePath}/dashboard`;
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}

function SignUpPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] ?? "");
  const redirectUrl = params.get("redirect_url") || `${basePath}/dashboard`;
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location] = useLocation();
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <SignInRedirect path={location} />
      </Show>
    </>
  );
}

function SignInRedirect({ path }: { path: string }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate(`/sign-in?redirect_url=${encodeURIComponent(path)}`, { replace: true });
  }, [path, navigate]);
  return null;
}

/** Wires Clerk's getToken() into the API client so every request carries a Bearer token. */
function ClerkAuthSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);
  return null;
}

/** Clears React Query cache whenever the signed-in user changes. */
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function AppRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignInUrl={`${basePath}/dashboard`}
      afterSignUpUrl={`${basePath}/dashboard`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your LocalBrand account",
          },
        },
        signUp: {
          start: {
            title: "Get started free",
            subtitle: "Create your LocalBrand account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthSync />
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            {/* Public: landing page with its own full-page layout */}
            <Route path="/" component={Landing} />

            {/* Auth pages: centered, no app chrome */}
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />

            {/* App pages: protected, wrapped in the app shell layout */}
            <Route>
              <Layout>
                <Switch>
                  <Route path="/dashboard">
                    <ProtectedRoute component={Dashboard} />
                  </Route>
                  <Route path="/gmb">
                    <ProtectedRoute component={GmbTrack} />
                  </Route>
                  <Route path="/review">
                    <ProtectedRoute component={ReviewTrack} />
                  </Route>
                  <Route path="/social">
                    <ProtectedRoute component={SocialTrack} />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <AppRoutes />
    </WouterRouter>
  );
}

export default App;
