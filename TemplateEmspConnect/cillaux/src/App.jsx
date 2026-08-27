import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import ProductDetail from "./pages/ProductDetail";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./index.css";
import BlogDetail from "./pages/BlogDetail";

/** One shell to rule them all */
function PageShell({ children, className = "" }) {
  // Pick one width and it will apply everywhere
  // (feel free to change max-w-* value)
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Header */}
      <PageShell>
        <NavBar />
      </PageShell>

      {/* Main content */}
      <main className="py-6">
        <PageShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
          </Routes>
        </PageShell>
      </main>

      {/* Footer */}
      <PageShell>
        <Footer />
      </PageShell>
    </BrowserRouter>
  );
}

export default App;
