"use client";
import { cn } from "@/utils/cn";
import React from "react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const mouseX = React.useRef(0);
  const mouseY = React.useRef(0);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative group/card w-full",
        containerClassName
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-50 group-hover:opacity-70 transition duration-500",
          animate && "animate-pulse",
          className
        )}
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,182,255,0.8), rgba(255,182,255,0.1) 50%)",
        }}
      />
      <div>{children}</div>
    </div>
  );
};