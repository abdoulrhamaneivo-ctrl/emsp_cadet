import React from "react";
import { Link } from "react-router-dom";
import chatIcon from "/assets/arrow.svg";

export default function Button({ title, bgColor, hoverBgColor, textColor = "text-white" }) {
  return (
    <div className="">
      <Link
        to="/contact"
        className={`flex gap-2 text-md items-center justify-center border border-gray-500 px-5 py-3 rounded-xl ${bgColor} ${hoverBgColor} ${textColor} font-medium`}
      >
        <p>{title}</p>
        <img src={chatIcon} alt="chat icon" />
      </Link>
    </div>
  );
}
