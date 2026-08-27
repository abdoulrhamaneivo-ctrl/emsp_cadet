import React from "react";
import ContactForm from "./ContactForm";
import Faq from "./Faq";
import WorkTogetherSlider from "./WorkTogetherSlider";

export default function ContactDetails() {
  return (
    <div
      className="col-span-2 bg-[var(--card)]
                border border-[var(--border)]
                text-[var(--text)] rounded-xl p-7 flex flex-col gap-10"
    >
      <div className="">
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl lg:text-4xl font-semibold">
            Let's 👋 <span className="text-blue-600">Work</span> Together
          </h2>
          <p className=" lg:text-xl">
            I'm here to help if you're searching for a product designer to bring
            your idea to life or a design partner to help take your business to
            the next level.
          </p>
        </div>
      </div>
      <ContactForm />
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83327.3714831671!2d-123.2063048519071!3d49.25781819059404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673f143a94fb3%3A0xbb9196ea9b81f38b!2sVancouver%2C%20BC!5e0!3m2!1sen!2sca!4v1760727608245!5m2!1sen!2sca"
        // width="600"
        height="400"
        // style="border:0;"
        // allowfullscreen=""
        loading="lazy"
        // referrerpolicy="no-referrer-when-downgrade"
        className="w-[100%] rounded-xl"
      ></iframe>
      <Faq />
      {/* <WorkTogetherSlider /> */}
    </div>
  );
}
