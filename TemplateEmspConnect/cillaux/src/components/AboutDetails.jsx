import React from "react";
import Brands from "./Brands";
import Testimonials from "./Testimonials";
import Certifications from "./Certifications";
import WorkTogetherSlider from "./WorkTogetherSlider";

export default function AboutDetails() {
  const workProof = [
    { id: 1, title: "Years of Experience", details: "40+" },
    { id: 2, title: "Project Completed", details: "86+" },
    { id: 3, title: "Happy Client", details: "72+" },
  ];

  return (
    <div
      className="col-span-2 rounded-xl p-7 flex flex-col gap-10 bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)]"
    >
      <div className="">
        <div className="flex items-start flex-col-reverse gap-5 lg:flex-row justify-between lg:items-center">
          <h2 className="text-2xl lg:text-4xl font-semibold">
            Hi, This Is <span className="text-blue-600">Priscillia Beaumont</span>
          </h2>
          <p className="text-lg text-blue-600 font-semibold bg-gray-200 rounded-lg py-2 px-3">
            Available For Hire
          </p>
        </div>
        <span className="text-5xl">👋</span>
      </div>
      <p className="text-lg lg:w-[50%] lg:text-2xl">
        A Passionate <strong>Full Stack Developer</strong> 🖥️ &{" "}
        <strong>Product Designer</strong>
        having <strong>12 years</strong> of Experiences over 24+ Country
        Worldwide.
      </p>

      <div className=" lg:w-[80%] grid grid-cols-3 my-5">
        {workProof.map((work) => (
          <div key={work.id}>
            <p className="text-2xl lg:text-5xl font-bold">{work.details}</p>
            <p className=" text-gray-500">{work.title}</p>
          </div>
        ))}
      </div>

      <Brands />
      <Testimonials />
      <Certifications />
      <WorkTogetherSlider />
    </div>
  );
}
