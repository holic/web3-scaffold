import Link from "next/link";
import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface Props {
  href?: string;
  children: React.ReactNode;
  loading?: boolean;
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
    <button
      className={`flex font-mono justify-center w-auto border-1 border-black bg-white font-mono px-6 py-3 z-150 select-none ${className} ${
        disabled && "opacity-60"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );

  if (href) {
    return <Link href={href}>{btn}</Link>;
  } else {
    return btn;
  }
};

export default Button;
