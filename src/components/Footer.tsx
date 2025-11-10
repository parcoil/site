function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-card dark:text-gray-300">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-4">
        <p className="text-sm text-center ">
          a parcoil site.{" "}
          <a href="mailto:info@parcoil.com" className="text-primary">
            info@parcoil.com
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
