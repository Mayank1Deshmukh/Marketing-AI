import { useEffect } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Star, Megaphone, CheckCircle2, ChevronRight, Briefcase, Loader2, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { BusinessProfile, BusinessProfileSchema } from "@/lib/profile";
import { useSaveProfile } from "@workspace/api-client-react";
import { useMyProfile, MY_PROFILE_QUERY_KEY } from "@/hooks/useMyProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<BusinessProfile>({
    resolver: zodResolver(BusinessProfileSchema),
    defaultValues: {
      businessName: "",
      city: "",
      neighborhoods: "",
      landmarks: "",
      offerings: "",
      brandVoice: "professional",
      secretSauce: "",
    },
  });

  const { data: myProfile, isLoading: isLoadingProfile } = useMyProfile();
  const hasProfile = !!myProfile;

  useEffect(() => {
    if (myProfile) {
      form.reset({
        businessName: myProfile.businessName,
        city: myProfile.city,
        neighborhoods: myProfile.neighborhoods,
        landmarks: myProfile.landmarks ?? "",
        offerings: myProfile.offerings,
        brandVoice: myProfile.brandVoice as BusinessProfile["brandVoice"],
        secretSauce: myProfile.secretSauce,
      });
    }
  }, [myProfile, form]);

  const saveProfileApi = useSaveProfile();

  const onSubmit = (data: BusinessProfile) => {
    saveProfileApi.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [...MY_PROFILE_QUERY_KEY] });
          toast({
            title: "Profile Saved",
            description: "Your business profile has been saved.",
            duration: 3000,
          });
        },
        onError: () => {
          toast({
            title: "Save Failed",
            description: "Could not save your profile. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner for new users */}
      {!isLoadingProfile && !hasProfile && isSignedIn && (
        <div className="rounded-2xl p-6 flex items-start gap-4 border" style={{ background: "hsl(195,20%,97%)", borderColor: "hsl(195,15%,85%)" }}>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(186,60%,20%)" }}>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Welcome to LocalBrand!</h3>
            <p className="text-sm text-muted-foreground">Fill in your business profile on the left — it only takes 2 minutes. Then pick a tool on the right to generate your first piece of hyper-local copy.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Profile Form */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">Business Profile</h1>
            <p className="text-sm text-muted-foreground">The core facts that ground your marketing copy in reality.</p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              {isLoadingProfile && (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}

              {!isLoadingProfile && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Austin Sourdough Co." {...field} data-testid="input-biz-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. East Austin, TX" {...field} data-testid="input-biz-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="neighborhoods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Neighborhood(s)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Holly, Plaza Saltillo" {...field} data-testid="input-biz-neighborhoods" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="landmarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nearby Landmarks (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Next to the metro station" {...field} data-testid="input-biz-landmarks" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="offerings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Offerings</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Sourdough bread, pastries, coffee" {...field} data-testid="input-biz-offerings" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="secretSauce"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>The "Secret Sauce"</FormLabel>
                          <FormDescription>What makes you special?</FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. We mill our own flour daily and use a 15-year-old starter."
                              className="resize-none"
                              {...field}
                              data-testid="input-biz-secret"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brandVoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Voice</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-brand-voice">
                                <SelectValue placeholder="Select a voice" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional & Trustworthy</SelectItem>
                              <SelectItem value="friendly">Warm & Friendly</SelectItem>
                              <SelectItem value="playful">Playful & Quirky</SelectItem>
                              <SelectItem value="nononsense">No-Nonsense & Direct</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isSignedIn && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <LogIn className="h-4 w-4 shrink-0" />
                        <span>
                          <Link href="/sign-in" className="underline font-semibold hover:text-amber-900">Sign in</Link>
                          {" "}to save your profile and access the AI tools.
                        </span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full font-medium"
                      data-testid="button-save-profile"
                      disabled={saveProfileApi.isPending || !isSignedIn}
                    >
                      {saveProfileApi.isPending ? (
                        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                      ) : hasProfile ? (
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Update Profile</span>
                      ) : (
                        <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Save Profile</span>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Track Cards */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold tracking-tight text-primary">What do you need today?</h2>
            <p className="text-sm text-muted-foreground">Select a task. We'll use your profile to generate custom, hyper-local copy.</p>
          </div>

          <div className="grid gap-4">
            <Link href="/gmb" className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl" data-testid="link-card-gmb">
              <Card className="hover:border-primary/50 transition-all cursor-pointer group hover-elevate">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Google My Business Post</h3>
                      <p className="text-sm text-muted-foreground">Generate an SEO-optimized local update</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/review" className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl" data-testid="link-card-review">
              <Card className="hover:border-primary/50 transition-all cursor-pointer group hover-elevate">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Smart Review Responder</h3>
                      <p className="text-sm text-muted-foreground">Reply to a customer review in your brand voice</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/social" className="block focus:outline-none focus:ring-2 focus:ring-ring rounded-xl" data-testid="link-card-social">
              <Card className="hover:border-primary/50 transition-all cursor-pointer group hover-elevate">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Megaphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Hyper-Local Social Ad</h3>
                      <p className="text-sm text-muted-foreground">Ad copy for Instagram, Facebook, or Nextdoor</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
