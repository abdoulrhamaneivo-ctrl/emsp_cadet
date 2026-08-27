import React from "react";
import AboutCard from "../components/AboutCard";
import AboutDetails from "../components/AboutDetails";
import Head from "../lib/Head";

const SITE_URL = "https://priscy-orcin.vercel.app";
const COVER_URL = "https://priscy-orcin.vercel.app/og-cover.jpg";
const LOGO_URL = "https://priscy-orcin.vercel.app/logo.png";
const TITLE = "About — Priscy Designs";
const DESCRIPTION =
  "Explore UI/UX, full-stack development, branding, and product design projects.";

export default function About() {
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    url: `${SITE_URL}/about`,
    description: DESCRIPTION,
    primaryImageOfPage: { "@type": "ImageObject", url: COVER_URL },
    publisher: {
      "@type": "Organization",
      name: "Priscy Designs",
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };

  return (
    <>
      <Head
        title={TITLE}
        description={DESCRIPTION}
        canonical={SITE_URL}
        og={{ url: SITE_URL, image: COVER_URL, siteName: "Priscy Designs" }}
        twitter={{ image: COVER_URL }}
        jsonLd={jsonLdWebPage}
      />
      <section className="lg:p-0 flex flex-col gap-5">
        <div className="p-0 flex flex-col gap-5 mt-14 lg:mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column: sticky card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                {" "}
                {/* adjust top-6 for offset under your navbar */}
                <AboutCard />
              </div>
            </div>

            {/* Right columns: long scrolling content */}
            <div className="lg:col-span-2">
              <AboutDetails />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
