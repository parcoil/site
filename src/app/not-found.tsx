import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

function NotFound() {
  return (
    <div className="flex flex-col ">
      <main className="grow flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="font-bold text-8xl text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground/80">
            Oops! Page not found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="inline-block mt-8">
            <Button className="group transition-all duration-300 hover:scale-105">
              <Home size={24} className="mr-2 group-hover:animate-bounce" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </main>

      <footer className="text-center py-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Parcoil. All rights reserved.
      </footer>
    </div>
  );
}

export default NotFound;
