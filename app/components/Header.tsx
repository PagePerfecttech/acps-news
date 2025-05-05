'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX, FiHome, FiGrid, FiBookmark, FiSettings, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const categories = [
    'అన్ని',
    'రాజకీయం',
    'సినిమా',
    'క్రీడలు',
    'వ్యాపారం',
    'టెక్',
    'ఆరోగ్యం',
    'విద్య',
  ];

  return (
    <header>
      {/* Way2News style header */}
      <div className="bg-yellow-500 text-black p-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="mr-3">
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <Link href="/" className="text-xl font-bold">
              FlipNews
            </Link>
          </div>
          <div className="flex items-center">
            <Link href="/search" className="mr-3">
              <FiSearch size={20} />
            </Link>
            <div className="bg-black text-white text-xs px-2 py-1 rounded">
              తెలుగు
            </div>
          </div>
        </div>
      </div>

      {/* Categories Scrollbar */}
      <div className="bg-white p-2 overflow-x-auto whitespace-nowrap sticky top-14 z-10 shadow-sm">
        <div className="flex space-x-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 hover:bg-yellow-100"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed top-0 left-0 h-full w-3/4 bg-white shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-4 bg-yellow-500 flex justify-between items-center">
              <span className="text-xl font-bold">FlipNews</span>
              <button onClick={toggleMenu}>
                <FiX size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-200 pb-2">
                  భాష (Language)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="border border-yellow-500 bg-yellow-50 text-black py-2 rounded text-sm font-medium">
                    తెలుగు
                  </button>
                  <button className="border border-gray-300 text-gray-700 py-2 rounded text-sm">
                    English
                  </button>
                  <button className="border border-gray-300 text-gray-700 py-2 rounded text-sm">
                    हिंदी
                  </button>
                  <button className="border border-gray-300 text-gray-700 py-2 rounded text-sm">
                    தமிழ்
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-200 pb-2">
                  వార్తలు (News)
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/category/${category}`}
                      className="block py-2 px-3 hover:bg-yellow-50 rounded"
                      onClick={toggleMenu}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-200 pb-2">
                  ఇతర (Other)
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/about"
                    className="block py-2 px-3 hover:bg-yellow-50 rounded"
                    onClick={toggleMenu}
                  >
                    మా గురించి (About Us)
                  </Link>
                  <Link
                    href="/contact"
                    className="block py-2 px-3 hover:bg-yellow-50 rounded"
                    onClick={toggleMenu}
                  >
                    సంప్రదించండి (Contact Us)
                  </Link>
                  <Link
                    href="/privacy"
                    className="block py-2 px-3 hover:bg-yellow-50 rounded"
                    onClick={toggleMenu}
                  >
                    ప్రైవసీ పాలసీ
                  </Link>
                  <Link
                    href="/admin/login"
                    className="block py-2 px-3 hover:bg-yellow-50 rounded mt-3 border-t border-gray-200 pt-3"
                    onClick={toggleMenu}
                  >
                    అడ్మిన్ లాగిన్ (Admin Login)
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 md:hidden">
        <Link href="/" className="flex flex-col items-center text-yellow-500">
          <FiHome size={20} />
          <span className="text-xs mt-1">హోమ్</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center text-gray-500">
          <FiGrid size={20} />
          <span className="text-xs mt-1">కేటగిరీలు</span>
        </Link>
        <Link href="/saved" className="flex flex-col items-center text-gray-500">
          <FiBookmark size={20} />
          <span className="text-xs mt-1">సేవ్డ్</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-gray-500">
          <FiSettings size={20} />
          <span className="text-xs mt-1">సెట్టింగ్స్</span>
        </Link>
      </div>
    </header>
  );
}
