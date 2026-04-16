import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DoorOpen,
  Users,
  IndianRupee,
  MessageSquareWarning,
  ClipboardCheck,
  BedDouble,
  Building2,
  Shield,
  GraduationCap,
  LogIn,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  FileText,
  Star,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronUp,
  Menu,
  X,
  Utensils,
  Wrench,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Dashboard", href: "#dashboards" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

const features = [
  { icon: Users, title: "Student Management", desc: "Register, track, and manage all student records digitally with ease." },
  { icon: IndianRupee, title: "Fee Tracking", desc: "Monitor fee payments, pending dues, and generate receipts instantly." },
  { icon: MessageSquareWarning, title: "Complaint System", desc: "Students can lodge complaints and track resolution status in real-time." },
  { icon: ClipboardCheck, title: "Attendance Management", desc: "Digital attendance tracking with daily reports and analytics." },
  { icon: BedDouble, title: "Room Allocation", desc: "Smart room assignment with occupancy tracking and availability status." },
];

const dashboards = [
  { icon: Building2, title: "Owner Dashboard", desc: "Complete hostel overview with revenue analytics, occupancy rates, and operational insights.", color: "bg-primary/10 text-primary" },
  { icon: Shield, title: "Rector Dashboard", desc: "Manage daily operations, student attendance, complaints, and room inspections.", color: "bg-accent/10 text-accent" },
  { icon: GraduationCap, title: "Student Dashboard", desc: "View room details, pay fees, lodge complaints, and check notice board updates.", color: "bg-status-pending/10 text-status-pending" },
];

const steps = [
  { num: "01", icon: LogIn, title: "Login to System", desc: "Securely login as Owner, Rector, or Student with role-based access." },
  { num: "02", icon: BarChart3, title: "Manage Hostel Data", desc: "Access dashboards to manage students, rooms, fees, and daily operations." },
  { num: "03", icon: FileText, title: "Track & Resolve", desc: "Monitor complaints, track fee payments, and generate reports effortlessly." },
];

const testimonials = [
  { name: "Rahul Sharma", role: "B.Tech Student", text: "The complaint system is amazing! I lodged a complaint and it was resolved within 24 hours. Great platform!", rating: 5 },
  { name: "Priya Patel", role: "M.Sc Student", text: "Paying fees online and checking my room details has never been easier. Very user-friendly interface!", rating: 5 },
  { name: "Amit Kumar", role: "BCA Student", text: "The notice board keeps me updated about all hostel events and food menu changes. Love it!", rating: 4 },
];

const notices = [
  { icon: Megaphone, title: "Annual Hostel Day Celebration", date: "March 15, 2026", desc: "All students are invited to the annual hostel day celebration in the common hall.", type: "Announcement" },
  { icon: Utensils, title: "Updated Food Menu – March", date: "March 1, 2026", desc: "New food menu with improved breakfast and dinner options. Check the dining hall notice board.", type: "Food Menu" },
  { icon: Wrench, title: "Water Supply Maintenance", date: "March 8, 2026", desc: "Scheduled maintenance for Block-B water supply from 10 AM to 2 PM. Please store water in advance.", type: "Maintenance" },
  { icon: CalendarDays, title: "Room Inspection Drive", date: "March 20, 2026", desc: "Monthly room inspection scheduled. Keep rooms clean and organized.", type: "Announcement" },
];

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenu(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      {/* NAVBAR */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-card/95 backdrop-blur-md shadow-card border-b border-border" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => scrollTo("#home")} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">Smart Hostel</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                {l.label}
              </button>
            ))}
            <Button size="sm" className="ml-3 rounded-xl" onClick={() => navigate("/login")}>
              <LogIn className="w-4 h-4 mr-1.5" /> Login
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-card border-t border-border px-4 pb-4 space-y-1 animate-fade-in">
            {navLinks.map((l) => (
              <button key={l.href} onClick={() => scrollTo(l.href)} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5">
                {l.label}
              </button>
            ))}
            <Button className="w-full mt-2 rounded-xl" onClick={() => { setMobileMenu(false); navigate("/login"); }}>
              <LogIn className="w-4 h-4 mr-1.5" /> Login
            </Button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Digital Hostel Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                Smart Hostel<br />
                <span className="text-primary">Management System</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Manage hostel operations easily with a smart digital platform. Streamline student management, fee tracking, and complaint resolution — all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-xl text-base px-8 h-12" onClick={() => scrollTo("#features")}>
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl text-base px-8 h-12" onClick={() => navigate("/login")}>
                  <LogIn className="w-4 h-4 mr-1.5" /> Login
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-2">
                {[["500+", "Students"], ["50+", "Rooms"], ["99%", "Uptime"]].map(([num, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-foreground">{num}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dashboard Preview Illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
                <div className="relative bg-card rounded-2xl border border-border shadow-card-hover p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-status-pending/60" />
                    <div className="w-3 h-3 rounded-full bg-status-resolved/60" />
                    <div className="ml-auto text-xs text-muted-foreground font-medium">Owner Dashboard</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Students", val: "100", color: "bg-primary/10 text-primary" },
                      { label: "Pending Fees", val: "₹2.4L", color: "bg-status-pending/10 text-status-pending" },
                      { label: "Complaints", val: "12", color: "bg-destructive/10 text-destructive" },
                      { label: "Rooms", val: "48/56", color: "bg-accent/10 text-accent" },
                    ].map((c) => (
                      <div key={c.label} className={cn("rounded-xl p-3 space-y-1", c.color.split(" ")[0])}>
                        <div className="text-xs text-muted-foreground">{c.label}</div>
                        <div className={cn("text-xl font-bold", c.color.split(" ")[1])}>{c.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-32 bg-muted/50 rounded-xl flex items-end px-4 pb-4 gap-2">
                    {[40, 65, 50, 80, 60, 75, 90, 55, 70, 85, 60, 78].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/60 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Features</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything You Need to Manage</h2>
            <p className="text-muted-foreground text-lg">A complete suite of tools designed to simplify hostel operations and enhance student experience.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="group border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-default">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <f.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARDS */}
      <section id="dashboards" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">Dashboards</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Role-Based Dashboards</h2>
            <p className="text-muted-foreground text-lg">Tailored experiences for every user — owners, rectors, and students get exactly what they need.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {dashboards.map((d, i) => (
              <Card key={i} className="group border-border hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                <CardContent className="p-8 text-center space-y-5">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto", d.color)}>
                    <d.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{d.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                  <Button variant="ghost" className="text-primary group-hover:bg-primary/5" onClick={() => navigate(i === 0 ? "/owner" : i === 1 ? "/rector" : "/student")}>
                    View Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple 3-Step Process</h2>
            <p className="text-muted-foreground text-lg">Get started in minutes with our intuitive platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-border" />
            {steps.map((s, i) => (
              <div key={i} className="relative text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto text-lg font-bold relative z-10">
                  {s.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">Testimonials</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">What Students Say</h2>
            <p className="text-muted-foreground text-lg">Hear from students who use Smart Hostel every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-border hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={cn("w-4 h-4", si < t.rating ? "text-status-pending fill-status-pending" : "text-border")} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICES */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Notices</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Latest Announcements</h2>
            <p className="text-muted-foreground text-lg">Stay updated with the latest hostel notices and announcements.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {notices.map((n, i) => (
              <Card key={i} className="border-border hover:shadow-card-hover transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <n.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{n.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.date}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-foreground text-background pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Smart Hostel</span>
              </div>
              <p className="text-sm text-background/60 leading-relaxed">A modern digital platform for managing hostel operations efficiently and transparently.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Quick Links</h4>
              <div className="space-y-2.5">
                {["Home", "Features", "Dashboard", "Contact"].map((l) => (
                  <button key={l} onClick={() => scrollTo(`#${l.toLowerCase()}`)} className="block text-sm text-background/60 hover:text-background transition-colors">{l}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-background/60">
                  <MapPin className="w-4 h-4 shrink-0" /> 123 University Road, City – 400001
                </div>
                <div className="flex items-center gap-2.5 text-sm text-background/60">
                  <Mail className="w-4 h-4 shrink-0" /> info@smarthostel.com
                </div>
                <div className="flex items-center gap-2.5 text-sm text-background/60">
                  <Phone className="w-4 h-4 shrink-0" /> +91 98765 43210
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Follow Us</h4>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-background/10 pt-6 text-center text-sm text-background/40">
            © 2026 Smart Hostel Management System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* SCROLL TO TOP */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-50 animate-fade-in"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Index;
