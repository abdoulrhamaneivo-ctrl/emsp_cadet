import React from "react";
import aboutImage from "/assets/user.jpg";
import Button from "./Button";
import fbIcon from "/assets/facebook.svg";
import instgramIcon from "/assets/instagram.svg";
import linkedinIcon from "/assets/linkedin.svg";
import figmaIcon from "/assets/figma.svg";

export default function AboutCard() {
  const socialMedia = [
    { id: 1, name: "Facebook", icon: fbIcon, link: "https://facebook.com" },
    {
      id: 2,
      name: "Instagram",
      icon: instgramIcon,
      link: "https://www.instagram.com/",
    },
    {
      id: 3,
      name: "LinkedIn",
      icon: linkedinIcon,
      link: "https://www.linkedin.com/",
    },
    { id: 4, name: "Figma", icon: figmaIcon, link: "https://figma.com" },
  ];

  return (
    <section
      className="rounded-xl p-3.5 w-full flex flex-col gap-6 bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
      aria-labelledby="about-heading"
    >
      {/* Portrait / cover media */}
      <figure className="rounded-lg w-full h-72 overflow-hidden">
        <img
          src={aboutImage}
          alt="Portrait of Priscilla Bankole-Daniel"
          className="rounded-lg w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Keep caption for screen readers only */}
        <figcaption className="sr-only">
          Priscillia Beaumont — Full-Stack Developer and Product Designer
        </figcaption>
      </figure>

      <h2 id="about-heading" className="text-2xl font-bold">
        Priscillia Beaumont <span aria-hidden="true">👋</span>
      </h2>

      <p className="text-lg">
        A passionate <strong>Full-Stack Developer</strong>{" "}
        <span aria-hidden="true">🖥️</span> & <strong>Product Designer</strong>{" "}
        with <strong>12 years</strong> of experience across 24+ countries
        worldwide.
      </p>

      {/* Primary actions */}
      <div
        className="flex flex-col lg:flex-row justify-evenly gap-2"
        role="group"
        aria-label="Contact actions"
      >
        <Button
          title="Book A Call"
          bgColor="bg-blue-500"
          hoverBgColor="hover:bg-blue-600"
          ariaLabel="Book a call with Priscilla"
        />
        <Button
          title="Send Email"
          bgColor="bg-[var(--card)]"
          hoverBgColor="hover:bg-[var(--hover)]"
          textColor="text-[var(--muted)]"
          ariaLabel="Send an email to Priscilla"
        />
      </div>

      {/* Social links as a list */}
      <nav aria-label="Social links">
        <ul className="flex flex-row gap-2">
          {socialMedia.map((item) => (
            <li key={item.id}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-400 p-2 bg-white rounded-lg inline-flex items-center justify-center"
                aria-label={`Open ${item.name} profile in a new tab`}
                title={item.name}
              >
                <img
                  src={item.icon}
                  alt="" /* decorative; label is on the link */
                  className="h-5 w-5"
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
