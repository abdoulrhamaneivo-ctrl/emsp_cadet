import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="container px-0 py-5 text-sm lg:text-lg"
      aria-label="Site footer"
    >
      <p className="text-center">
        <span className="sr-only">Copyright </span>
        <span aria-hidden="true">&copy;</span> PriscyDesigns{" "}
        <time dateTime={`${year}`}>{year}</time>, Design by{" "}
        <a
          href="https://craftedtemplate.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold underline-offset-2 hover:underline"
        >
          Crafted Template
        </a>
      </p>
    </footer>
  );
}
