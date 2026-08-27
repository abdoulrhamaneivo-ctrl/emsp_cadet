import React from "react";
import certificateData from "../data/certifications.json";
import { Link } from "react-router-dom";
import chatIcon from "/assets/arrow-up-right.svg";

function isExternal(href = "") {
  return /^https?:\/\//i.test(href);
}

export default function Certifications() {
  return (
    <section className="flex flex-col gap-5" aria-labelledby="certs-heading">
      <h2 id="certs-heading" className="text-2xl lg:text-3xl font-semibold">
        Professional Certifications
      </h2>

      <ul className="flex flex-col gap-5">
        {certificateData.map((data) => {
          const External = isExternal(data.link);
          const Wrapper = External ? "a" : Link;
          const wrapperProps = External
            ? {
                href: data.link,
                target: "_blank",
                rel: "noopener noreferrer",
              }
            : { to: data.link };

          return (
            <li key={data.id} className="list-none">
              <article
                className="bg-[var(--card)] border border-[var(--border)] text-[var(--text)] p-5 grid lg:grid-cols-2 gap-10 rounded-lg"
                aria-labelledby={`cert-title-${data.id}`}
              >
                {/* Left: logo + meta */}
                <div className="flex gap-10 items-center bg-[var(--card)]">
                  <figure className="shrink-0 w-24 h-24 flex items-center justify-center rounded-md overflow-hidden bg-white border border-[var(--border)]">
                    <img
                      src={data.image}
                      alt="" /* decorative; caption carries the name */
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption className="sr-only">{data.title}</figcaption>
                  </figure>

                  <div>
                    <h3
                      id={`cert-title-${data.id}`}
                      className="text-xl font-semibold"
                    >
                      {data.title}
                    </h3>
                    {data.year && (
                      <p className="text-sm text-gray-500">
                        <span className="sr-only">Year: </span>
                        <time dateTime={`${data.year}-01-01`}>{data.year}</time>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: status + link */}
                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    <span className="sr-only">Status: </span>
                    {data.status}
                  </p>

                  <Wrapper
                    {...wrapperProps}
                    className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] px-4 py-2 rounded-lg hover:bg-[var(--hover)]"
                    aria-label={`View certificate: ${data.title}`}
                  >
                    <span>View Certificate</span>
                    <img
                      src={chatIcon}
                      alt=""
                      aria-hidden="true"
                      className="w-5 h-5"
                      loading="lazy"
                      decoding="async"
                    />
                  </Wrapper>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
