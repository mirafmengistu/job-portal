import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Briefcase, LogOut, Menu, X } from 'lucide-react';

const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sticky Modern Navbar */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2" onClick={closeMobile}>
            <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">J</span>
            JobPortal
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jobs
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                {user?.role === 'recruiter' && (
                  <Link to="/post-job" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Post Job
                  </Link>
                )}

                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-2 hover:bg-muted/60 px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                      {getInitials(user?.name || 'User')}
                    </div>
                    <span className="text-sm font-medium">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  <div className="absolute right-0 mt-2 w-56 bg-card text-card-foreground rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    <div className="p-3 border-b border-border bg-muted/30">
                      <p className="font-semibold text-sm line-clamp-1">{user?.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{user?.email}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg w-full text-left transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                  Login
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="font-medium px-4">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors border border-border"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border px-4 py-4 space-y-2 bg-card">
            <Link
              to="/"
              onClick={closeMobile}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              onClick={closeMobile}
              className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Jobs
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobile}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Dashboard
                </Link>
                {user?.role === 'recruiter' && (
                  <Link
                    to="/post-job"
                    onClick={closeMobile}
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Post Job
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Profile
                </Link>
                <div className="border-t border-border pt-3 mt-2">
                  <p className="px-3 text-sm font-semibold">{user?.name}</p>
                  <p className="px-3 text-xs text-muted-foreground mb-3">{user?.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="flex items-center gap-2 w-full py-2.5 px-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="block text-center py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors border border-border"
                >
                  Login
                </Link>
                <Link to="/signup" onClick={closeMobile} className="block">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-border bg-card text-muted-foreground py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">J</span>
            JobPortal
          </div>
          <p>© 2026 JobPortal. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

