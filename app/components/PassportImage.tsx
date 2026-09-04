"use client";

import { usePathname } from "next/navigation";

export default function PassportImage() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <img
      src="/passport.png"
      alt=""
      className="absolute object-contain pointer-events-none hidden xl:block -mt-20"
      style={{
        left: "-170px",
        top: "0px",
        width: "240px",
        height: "auto",
        zIndex: 30,
        transform: "rotate(-15deg)",
      }}
    />
  );
}
