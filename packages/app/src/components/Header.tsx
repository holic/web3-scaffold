import Link from "next/link";
import React from "react";

interface HeaderProps {
  title: string;
}

const Header = ({ title = "Daily Canvas" }: HeaderProps) => {
  return (
    <Link href="/">
      <div className="flex text-white font-mono text-2xl pt-7 pb-6 justify-center items-center cursor-pointer z-50">
        {title}
      </div>
    </Link>
  );
};

export default Header;
