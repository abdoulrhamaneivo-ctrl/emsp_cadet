import React from "react";
import ServiceOffer from "./ServiceOffer";
import bannerImg from "/assets/blog-img.jpg";
import Brands from "./Brands";
import Testimonials from "./Testimonials";
import Certifications from "./Certifications";
import Faq from "./Faq";
import WorkTogetherSlider from "./WorkTogetherSlider";

export default function ServiceDetails() {
  return (
    <div className="col-span-2 bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)] rounded-xl p-7 flex flex-col gap-10">
      <div className="">
        <div className="flex items-start flex-col-reverse gap-5 lg:flex-row justify-between lg:items-center">
          <h2 className="text-4xl font-semibold">
            Services I <span className="text-blue-600">Offer</span>
          </h2>
          <p className="text-lg text-blue-600 font-semibold bg-gray-200 rounded-lg py-2 px-3">
            Available For Hire
          </p>
        </div>
  
      </div>
      <p className="text-lg lg:w-[50%] lg:text-2xl">
        Transforming Ideas into Innovative Reality, Elevate Your Vision with Our
        Expert <strong>Product Design and Development</strong> Services!
      </p>

      <div className="flex flex-col gap-10">
        <ServiceOffer />
        <img
          src={bannerImg}
          alt="banner image"
          className="rounded-lg object-cover h-92 w-full"
        />
        <Brands />
        <Testimonials />
        <Certifications />
        <Faq />
        <WorkTogetherSlider />
      </div>
    </div>
  );
}
