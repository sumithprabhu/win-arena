import { usePathname } from "next/navigation";

const Footer = () => {
    const pathname = usePathname();
  
  return (
    <footer
      className={`w-full text-center  ${pathname === "/" ? "text-black bg-trasparent" : "text-white bg-black"}  p-4 mt-8`}
    >
      <p>&copy; 2025 Win Arena. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
