import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Button } from "./ui/button";
import { Shield, Lock, Eye, Zap, BarChart3, AlertTriangle } from "lucide-react";
import hexagonPattern from "../assets/hexagon.png";


export function HomePage() {
  return (
    <div className="h-[900px] bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Hexagonal Network Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${hexagonPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      <Navbar currentPage="home" />
      
      {/* Left Side Decorative Elements */}
      <div className="absolute left-0 top-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute left-10 top-1/2 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl"></div>
      
      {/* Right Side Decorative Elements */}
      <div className="absolute right-0 top-1/3 w-72 h-72 bg-slate-200/20 rounded-full blur-3xl"></div>
      <div className="absolute right-10 bottom-1/4 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl"></div>
      
      {/* Floating Icons - Left Side */}
      <div className="absolute left-20 top-1/4 opacity-10">
        <Shield className="w-16 h-16 text-primary animate-pulse" />
      </div>
      <div className="absolute left-32 bottom-1/3 opacity-10">
        <Lock className="w-12 h-12 text-primary animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute left-16 top-2/3 opacity-10">
        <AlertTriangle className="w-14 h-14 text-primary animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Floating Icons - Right Side */}
      <div className="absolute right-20 top-1/3 opacity-10">
        <Eye className="w-14 h-14 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <div className="absolute right-32 top-2/3 opacity-10">
        <Zap className="w-12 h-12 text-primary animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      <div className="absolute right-16 bottom-1/4 opacity-10">
        <BarChart3 className="w-16 h-16 text-primary animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>
      
      {/* Animated Background with Attack Types */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-xs text-primary animate-pulse">
          SQL Injection Detected...
        </div>
        <div className="absolute top-40 right-20 text-xs text-secondary animate-pulse delay-100">
          Brute Force Attempt Blocked
        </div>
        <div className="absolute bottom-40 left-1/4 text-xs text-primary animate-pulse delay-200">
          XSS Attack Neutralized
        </div>
        <div className="absolute top-1/3 right-1/3 text-xs text-secondary animate-pulse delay-300">
          Port Scan Detected: 192.168.1.x
        </div>
        <div className="absolute bottom-20 right-10 text-xs text-primary animate-pulse delay-150">
          LFI Mitigation Active
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-primary animate-pulse" />
          </div>
          
          <h1 className="text-5xl mb-3 text-foreground">
            HWACS
          </h1>
          
          <p className="text-xl text-primary mb-4">
            HoneyPot Web Attack Capture System  
          </p>
          
          <div className="mb-4 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-primary/30 inline-block">
            <p className="text-lg text-muted-foreground">
              Smart XAI
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Catch the Attack Before It Catches You!
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Showcase Section */}
      <section className="relative z-10 py-8">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20">
                <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="mb-1">Real-Time Detection</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor attacks as they happen with live threat feeds
                </p>
              </div>

              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20">
                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="mb-1">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize patterns with interactive charts and graphs
                </p>
              </div>

              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/20">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="mb-1">AI-Powered Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Generate explainable insights with smart analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full h-[160px] bg-[#F5F7FB] z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>HWACS</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Advanced honeypot security monitoring for modern infrastructure.
              </p>
            </div>

            <div>
              <h4 className="mb-2 text-sm">Product</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><Link to="/signup" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Security</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm">Resources</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm">Company</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-muted-foreground">
              © 2025 HWACS. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
