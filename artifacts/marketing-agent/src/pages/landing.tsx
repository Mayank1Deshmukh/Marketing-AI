import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Store, MapPin, Star, Megaphone, ArrowRight, CheckCircle2, Sparkles, Briefcase, Layers, ChevronRight } from "lucide-react";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Landing() {
  const { isSignedIn } = useUser();
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isSignedIn) navigate("/dashboard");
  }, [isSignedIn, navigate]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 backdrop-blur-md bg-[hsl(186,65%,12%)]/90 shadow-lg"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Store className="h-5 w-5" />
            LocalBrand
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                className="font-bold bg-[hsl(43,90%,55%)] hover:bg-[hsl(43,90%,48%)] text-[hsl(195,50%,10%)] border-0 px-5"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-center min-h-screen"
        style={{
          background:
            "linear-gradient(135deg, hsl(186,65%,12%) 0%, hsl(186,60%,20%) 55%, hsl(195,55%,22%) 100%)",
        }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-[0.12]"
          style={{ background: "hsl(43,90%,55%)", filter: "blur(100px)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none opacity-10"
          style={{ background: "hsl(186,60%,50%)", filter: "blur(70px)" }}
        />

        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full mb-8 border"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[hsl(43,90%,60%)]" />
                Powered by Google Gemini 2.5 Flash
              </div>

              <h1 className="text-5xl lg:text-6xl font-serif font-bold leading-[1.1] text-white mb-6">
                Your Local Business,{" "}
                <span className="text-[hsl(43,90%,62%)]">Marketing Itself</span>
              </h1>

              <p
                className="text-xl leading-relaxed mb-10"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                Generate hyper-local GMB posts, review responses, and social ads in
                seconds — crafted for your exact neighborhood, in your brand voice.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="h-12 px-8 font-bold text-base border-0"
                    style={{
                      background: "hsl(43,90%,55%)",
                      color: "hsl(195,50%,10%)",
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 font-semibold text-base text-white hover:bg-white/10"
                    style={{ borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Free to start · No credit card required
              </p>
            </div>

            {/* App preview mockup */}
            <div className="hidden lg:block">
              <div
                className="rounded-2xl overflow-hidden border shadow-2xl"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* Browser chrome */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.25)",
                  }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div
                    className="flex-1 mx-3 rounded text-xs px-3 py-0.5 text-center"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    localbrand.app/dashboard
                  </div>
                </div>

                {/* App content */}
                <div className="p-5 space-y-3">
                  {/* Generated output card */}
                  <div className="rounded-xl p-4 bg-white">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "hsl(186,60%,20%)" }}
                      >
                        <MapPin className="w-4 w-4 text-white h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs font-bold"
                          style={{ color: "hsl(195,50%,10%)" }}
                        >
                          Google My Business Post
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "hsl(195,15%,45%)" }}
                        >
                          Austin Sourdough Co. · East Austin, TX
                        </div>
                      </div>
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "hsl(195,50%,15%)" }}
                    >
                      🍞 Fresh from the Holly neighborhood! Our 15-year-old sourdough
                      starter is working overtime this week. Stop by Plaza Saltillo or
                      find us near the Metro — your morning ritual just got an upgrade.
                    </p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {["#EastAustin", "#Sourdough", "#LocalBakery", "#HollyATX"].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: "hsl(195,20%,94%)",
                              color: "hsl(186,60%,25%)",
                            }}
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Track pills */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { icon: MapPin, label: "GMB Post", cls: "bg-blue-500/20 text-blue-200" },
                      { icon: Star, label: "Review Reply", cls: "bg-amber-500/20 text-amber-200" },
                      { icon: Megaphone, label: "Social Ad", cls: "bg-purple-500/20 text-purple-200" },
                    ].map(({ icon: Icon, label, cls }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${cls}`}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-12 block"
            style={{ fill: "hsl(195,20%,98%)" }}
          >
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="py-12 bg-[hsl(195,20%,98%)]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 text-center divide-x divide-border">
            {[
              { value: "3 tools", label: "Built-in marketing tools" },
              { value: "< 30 sec", label: "Time to generate copy" },
              { value: "100%", label: "Hyper-local & brand-tuned" },
            ].map(({ value, label }) => (
              <div key={label} className="px-4">
                <div
                  className="text-3xl font-serif font-bold mb-1"
                  style={{ color: "hsl(186,60%,20%)" }}
                >
                  {value}
                </div>
                <div className="text-sm" style={{ color: "hsl(195,15%,45%)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "hsl(43,90%,45%)" }}
            >
              What's included
            </p>
            <h2
              className="text-4xl font-serif font-bold"
              style={{ color: "hsl(186,60%,20%)" }}
            >
              Three tools. One platform.
            </h2>
            <p
              className="text-lg mt-4 max-w-2xl mx-auto"
              style={{ color: "hsl(195,15%,45%)" }}
            >
              Everything a local business needs to stay visible and relevant in their
              neighborhood — no marketing degree required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                bgCls: "bg-blue-100",
                iconCls: "text-blue-600",
                title: "Google My Business Posts",
                description:
                  "Stay top-of-mind with SEO-rich GMB updates that naturally weave in your neighborhood, nearby landmarks, and seasonal hooks.",
                features: [
                  "Neighborhood keyword targeting",
                  "Local landmark mentions",
                  "Seasonal & event relevance",
                ],
              },
              {
                icon: Star,
                bgCls: "bg-amber-100",
                iconCls: "text-amber-600",
                title: "Smart Review Responses",
                description:
                  "Turn every review into a brand-building moment. Get personalized, sentiment-aware replies that feel human — because they start with your voice.",
                features: [
                  "Automatic sentiment detection",
                  "Brand voice matching",
                  "Highlights key praise",
                ],
              },
              {
                icon: Megaphone,
                bgCls: "bg-purple-100",
                iconCls: "text-purple-600",
                title: "Hyper-Local Social Ads",
                description:
                  "Stop guessing what to post. Get Instagram captions, Facebook ads, and Nextdoor copy built around the proximity hooks that drive foot traffic.",
                features: [
                  "Instagram, Facebook & Nextdoor",
                  "Proximity framework strategy",
                  "Hashtag suggestions",
                ],
              },
            ].map(({ icon: Icon, bgCls, iconCls, title, description, features }) => (
              <Card
                key={title}
                className="border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${bgCls} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-7 w-7 ${iconCls}`} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "hsl(195,50%,10%)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "hsl(195,15%,45%)" }}
                  >
                    {description}
                  </p>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          style={{ color: "hsl(186,60%,30%)" }}
                        />
                        <span style={{ color: "hsl(195,40%,20%)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-24 bg-[hsl(195,20%,97%)]">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "hsl(43,90%,45%)" }}
            >
              How it works
            </p>
            <h2
              className="text-4xl font-serif font-bold"
              style={{ color: "hsl(186,60%,20%)" }}
            >
              Up and running in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                icon: Briefcase,
                title: "Build your profile",
                description:
                  "Enter your business name, city, neighborhoods, nearby landmarks, and what makes you unique. Takes about 2 minutes.",
              },
              {
                step: "02",
                icon: Layers,
                title: "Choose a tool",
                description:
                  "Pick the marketing task you need: a Google My Business post, a review response, or a social media ad.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Get your copy",
                description:
                  "Gemini AI generates hyper-local, brand-tuned copy instantly. Edit, copy, and publish — it's that simple.",
              },
            ].map(({ step, icon: Icon, title, description }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: "hsl(186,60%,20%)" }}
                  >
                    <Icon className="h-9 w-9" />
                  </div>
                  <div
                    className="absolute -top-2.5 -right-2.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                    style={{
                      background: "hsl(43,90%,55%)",
                      color: "hsl(195,50%,10%)",
                    }}
                  >
                    {step}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "hsl(195,50%,10%)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: "hsl(195,15%,45%)" }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>

          {/* Connector arrows (desktop only) */}
          <div className="hidden md:flex items-center justify-center gap-0 mt-[-120px] pointer-events-none">
            <div className="w-[33%]" />
            <ChevronRight className="h-6 w-6" style={{ color: "hsl(186,60%,55%)" }} />
            <div className="w-[33%]" />
            <ChevronRight className="h-6 w-6" style={{ color: "hsl(186,60%,55%)" }} />
            <div className="w-[33%]" />
          </div>
        </div>
      </section>

      {/* ── SAMPLE OUTPUT ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-widest mb-3"
                style={{ color: "hsl(43,90%,45%)" }}
              >
                See it in action
              </p>
              <h2
                className="text-4xl font-serif font-bold mb-6"
                style={{ color: "hsl(186,60%,20%)" }}
              >
                Real output, zero effort
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: "hsl(195,15%,45%)" }}>
                Enter your business profile once. Then generate as many posts,
                responses, and ads as you need — each one grounded in your real
                neighborhood context.
              </p>
              <Link href="/sign-up">
                <Button className="font-semibold gap-2" style={{ background: "hsl(186,60%,20%)" }}>
                  Try it now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Sample GMB output */}
            <div className="space-y-4">
              <div
                className="rounded-2xl border shadow-lg overflow-hidden"
                style={{ borderColor: "hsl(195,15%,85%)" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-3 border-b"
                  style={{
                    background: "hsl(195,20%,97%)",
                    borderColor: "hsl(195,15%,85%)",
                  }}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "hsl(186,60%,20%)" }}
                  >
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: "hsl(195,50%,10%)" }}>
                      Google My Business Post
                    </div>
                    <div className="text-xs" style={{ color: "hsl(195,15%,50%)" }}>
                      Generated for: Austin Sourdough Co.
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "hsl(195,50%,15%)" }}
                  >
                    🍞 The Holly neighborhood deserves the best sourdough in East Austin
                    — and we deliver. Made from our 15-year-old starter, milled fresh
                    daily, right here near Plaza Saltillo Metro. Whether you're catching
                    the train or exploring the neighborhood, stop in. Your mornings will
                    never be the same.{" "}
                    <span style={{ color: "hsl(186,60%,30%)" }}>
                      #EastAustin #LocalBakery #SourdoughATX #HollyNeighborhood
                    </span>
                  </p>
                  <div
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{
                      background: "hsl(195,20%,97%)",
                      color: "hsl(195,15%,45%)",
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[hsl(43,90%,45%)]" />
                    Generated in 2.1 seconds · Gemini 2.5 Flash
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section
        className="py-28"
        style={{
          background:
            "linear-gradient(135deg, hsl(43,85%,48%) 0%, hsl(43,90%,62%) 100%)",
        }}
      >
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2
            className="text-4xl md:text-5xl font-serif font-bold mb-6"
            style={{ color: "hsl(195,50%,10%)" }}
          >
            Ready to grow locally?
          </h2>
          <p
            className="text-xl mb-10 max-w-xl mx-auto"
            style={{ color: "hsl(195,40%,22%)" }}
          >
            Set up your business profile in minutes and start generating
            hyper-local marketing copy today.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-13 px-10 font-bold text-base border-0 shadow-lg"
              style={{ background: "hsl(186,60%,20%)", color: "white" }}
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <p
            className="text-sm mt-5"
            style={{ color: "hsl(195,40%,30%)" }}
          >
            Free to start · No credit card required
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        className="py-8 border-t"
        style={{ background: "hsl(195,50%,10%)" }}
      >
        <div className="container max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Store className="h-5 w-5" />
            LocalBrand
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            AI-powered marketing for local businesses.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-white transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
