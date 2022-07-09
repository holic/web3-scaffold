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
      className={`flex text-white font-mono text-2xl justify-center items-center cursor-pointer w-full select-none ${className}`}
    >
      <Link href="/">
        <span className="z-50">{title}</span>
      </Link>
    </div>
  );
};

export default Header;
