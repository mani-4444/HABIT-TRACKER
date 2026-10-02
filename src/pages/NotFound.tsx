import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-hero p-4">
      <div className="floating-orb -left-20 top-12 h-64 w-64 bg-primary/30 animate-float-slow" />
      <div
        className="floating-orb -right-16 bottom-0 h-72 w-72 bg-accent/55 animate-pulse-glow"
        style={{ animationDelay: "-4s" }}
      />

      <div className="page-enter ambient-panel relative z-10 w-full max-w-md rounded-[1.8rem] p-8 text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-[0.95] text-foreground">
          Page not found.
          <br />
          <span className="text-primary">Your streak isn't.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          The page <span className="font-medium text-foreground">{location.pathname}</span> doesn't exist.
        </p>
        <Button asChild className="mt-6 h-11 rounded-xl px-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
