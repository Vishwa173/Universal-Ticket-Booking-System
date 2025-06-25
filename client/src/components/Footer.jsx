import { FaFacebookF, FaInstagram, FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-gray-300 px-8 py-10 text-sm font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-wide font-bebas">OmniTix</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 text-sm">
          <a href="#" className="text-white hover:text-gray-300 transition">Terms & Conditions</a>
          <a href="#" className="text-white hover:text-gray-300 transition">Privacy Policy</a>
          <a href="#" className="text-white hover:text-gray-300 transition">Contact Us</a>
          <a href="#" className="text-white hover:text-gray-300 transition">List your events</a>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4 mt-2 text-lg text-white">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaXTwitter /></a>
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-700" />

      <p className="text-center text-gray-500 text-xs">
        By accessing this page, you confirm that you have read, understood, and agreed to our
        Terms of Service, Cookie Policy, and Content Guidelines. All rights reserved © {new Date().getFullYear()} OmniTix.
      </p>
    </footer>
  );
}
