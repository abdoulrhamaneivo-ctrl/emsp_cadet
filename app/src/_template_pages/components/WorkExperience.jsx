import React from "react";
import workData from "../data/work.json";

export default function WorkExperience() {
  return (
    <div className="">
      {" "}
      {/* 50% of parent */}
      <div
        className="bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)] rounded-xl shadow px-5 py-3"
      >
        <h1 className="text-2xl font-semibold py-2">Work Experience</h1>

        {/* Auto-scrolling viewport */}
        <div className="group relative h-60 overflow-hidden">
          {" "}
          {/* adjust h-80 as you like */}
          <div className="animate-scroll-up group-hover:[animation-play-state:paused]">
            {/* CONTENT BLOCK 1 */}
            <div className="space-y-6">
              {workData.map((work) => (
                <div key={`a-${work.id}`} className="flex gap-4 items-center">
                  <div className="w-[35%] shrink-0">
                    <p>{work.year}</p>
                  </div>
                  <div className=" w-12 h-10 p-1 rounded-xl shrink-0">
                    <img
                      src={work.image}
                      alt={`${work.company} icon`}
                      className=" w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-[50%]">
                    <h3 className="font-bold">{work.company}</h3>
                    <p>{work.position}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CONTENT BLOCK 2 (duplicate for seamless loop) */}
            <div className="space-y-6" aria-hidden="true">
              {workData.map((work) => (
                <div key={`b-${work.id}`} className="flex gap-4 items-center">
                  <div className="w-[35%] shrink-0">
                    <p>{work.year}</p>
                  </div>
                  <div className=" w-12 h-10 p-1 rounded-xl shrink-0">
                    <img
                      src={work.image}
                      alt=""
                      className="w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-[50%]">
                    <h3 className="font-bold">{work.company}</h3>
                    <p>{work.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Local styles for the marquee effect */}
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); } /* move past the first block */
        }
        .animate-scroll-up {
          display: grid;           /* ensures the two blocks stack without extra gaps */
          gap: 1.5rem;             /* matches space-y-6 (1.5rem) visually; optional */
          animation: scroll-up 20s linear infinite; /* adjust duration for speed */
        }
      `}</style>
    </div>
  );
}
