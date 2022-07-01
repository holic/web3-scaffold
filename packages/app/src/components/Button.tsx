import Link from "next/link";
import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface Props {
  href?: string;
  children: React.ReactNode;
}

type ButtonProps = Props &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

const Button = ({
  onClick,
  children,
  className,
  href,
  disabled,
}: ButtonProps) => {
  const btn = (
    <div
      className={`flex justify-center w-auto border-1 border-black bg-white text-black font-mono px-6 py-3 z-150 ${className}`}
    >
      {/* @ts-ignore */}
      <button className="font-mono" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </div>
  );

  if (href) {
    return <Link href={href}>{btn}</Link>;
  } else {
    return btn;
  }
};

export default Button;
