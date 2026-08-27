import React from "react";
import WorkTogetherSlider from "./WorkTogetherSlider";
import ProjectCards from "./ProjectCards";

export default function ProjectDetails() {
  return (
    <div
      className="col-span-2 bg-[var(--card)]
                    border border-[var(--border)]
                    text-[var(--text)] rounded-xl p-7 flex flex-col gap-10"
    >
      <div className="">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl lg:text-4xl font-semibold">
            Check Out My Latest <span className="text-blue-600">Projects</span>
          </h2>
          <p className=" lg:text-xl">
            I'm here to help if you're searching for a product designer to bring
            your idea to life or a design partner to help take your business to
            the next level.
          </p>
        </div>
      </div>
      <ProjectCards />
      <WorkTogetherSlider />
    </div>
  );
}
