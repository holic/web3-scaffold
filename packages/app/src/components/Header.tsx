import Link from "next/link";
import React from "react";

interface HeaderProps {
  title: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Header = ({ title = "Daily Canvas", onClick }: HeaderProps) => {
  return (
    <div
      onClick={onClick}
      className="flex text-white background font-mono text-2xl pt-6 justify-center items-center cursor-pointer w-full"
    >
      <Link href="/">
        <span className="z-50">{title}</span>
      </Link>
      <style jsx>
        {`
          .background {
            background: linear-gradient(
              0deg,
              rgba(0, 0, 0, 0) 0%,
              #000000 100%
            );
          }
        `}
      </style>
    </div>
  );
};

export default Header;
