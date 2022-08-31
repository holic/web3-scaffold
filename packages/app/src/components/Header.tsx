import Link from "next/link";
import React from "react";

interface HeaderProps {
  title: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

const Header = ({
  title = "Daily Canvas",
  onClick,
  className = "",
}: HeaderProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-10 z-50 text-lg w-full text-center text-white select-none font-mono bg-gradient-to-b from-[#131313] to-background-opacity-0 ${className}`}
    >
      <Link href="/">
        <span className="z-50">{title}</span>
      </Link>
    </div>
  );
};

export default Header;
