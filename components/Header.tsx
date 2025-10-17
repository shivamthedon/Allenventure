import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenIcon, HomeIcon, DocumentTextIcon } from './icons/Icons';
import { Logo } from './Logo';

const Header: React.FC = () => {
  const activeLinkStyle = {
    color: '#3b82f6', // blue-500
    backgroundColor: '#eff6ff' // blue-50
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <NavLink to="/" className="flex items-center">
          <Logo className="h-12 w-auto" />
        </NavLink>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <NavLink
            to="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105"
            style={({ isActive }) => isActive ? activeLinkStyle : {}}
          >
            <HomeIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink
            to="/learn"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105"
            style={({ isActive }) => isActive ? activeLinkStyle : {}}
          >
            <BookOpenIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Learn</span>
          </NavLink>
          <NavLink
            to="/project-document"
            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-200 transform hover:scale-105"
            style={({ isActive }) => isActive ? activeLinkStyle : {}}
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Project Doc</span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Header;