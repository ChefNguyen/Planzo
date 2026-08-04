import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  User as UserIcon,
  Compass,
  Sparkles,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { User } from '../lib/firebase';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCalendarConnected: boolean;
  onToggleCalendar: () => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isCalendarConnected,
  onToggleCalendar,
  currentUser,
  onSignIn,
  onSignOut,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: string) => {
    onSelectTab(tab);
    setIsDropdownOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-8 lg:px-[120px] py-3 bg-[#fbf9f4]/85 backdrop-blur-xl border-b border-[#bac9c9]/30 shadow-xs transition-all">
      {/* Brand & Nav */}
      <div className="flex items-center gap-6 md:gap-10">
        <button
          onClick={() => handleNavClick('explore')}
          className="text-2xl font-extrabold tracking-tight text-[#00696b] font-headline hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <span>Planzo AI</span>
        </button>

        <nav className="hidden md:flex items-center gap-8 ml-4">
          <button
            onClick={() => handleNavClick('explore')}
            className={`font-body text-base transition-colors py-1 ${
              currentTab === 'explore'
                ? 'text-[#00696b] border-b-2 border-[#00696b] font-bold'
                : 'text-[#3b4949] hover:text-[#00696b]'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => handleNavClick('my-trips')}
            className={`font-body text-base transition-colors py-1 ${
              currentTab === 'my-trips'
                ? 'text-[#00696b] border-b-2 border-[#00696b] font-bold'
                : 'text-[#3b4949] hover:text-[#00696b]'
            }`}
          >
            My Trips
          </button>
          <button
            onClick={() => handleNavClick('community')}
            className={`font-body text-base transition-colors py-1 ${
              currentTab === 'community'
                ? 'text-[#00696b] border-b-2 border-[#00696b] font-bold'
                : 'text-[#3b4949] hover:text-[#00696b]'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => handleNavClick('vibe-check')}
            className={`font-body text-base transition-colors py-1 ${
              currentTab === 'vibe-check'
                ? 'text-[#00696b] border-b-2 border-[#00696b] font-bold'
                : 'text-[#3b4949] hover:text-[#00696b]'
            }`}
          >
            Vibe Check
          </button>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden sm:flex flex-col items-end">
          <button
            onClick={onToggleCalendar}
            className={`text-xs font-semibold tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              isCalendarConnected
                ? 'text-[#00696b] bg-[#00ced1]/15 hover:bg-[#00ced1]/25'
                : 'text-[#6b7a7a] bg-black/5 hover:bg-black/10'
            }`}
            title="Toggle Google Calendar Sync"
          >
            <Calendar className="w-3.5 h-3.5 text-[#00696b]" />
            <span>{isCalendarConnected ? 'Calendar Connected' : 'Connect Calendar'}</span>
            {isCalendarConnected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00696b] ml-0.5" />}
          </button>
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onSignIn}
                className="bg-[#00696b] text-white px-4 sm:px-5 py-2 rounded-full font-semibold text-xs sm:text-sm hover:bg-[#005354] hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                Sign in with Google
              </button>

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#eae8e3] border border-[#bac9c9]/50 flex items-center justify-center text-[#00696b] hover:bg-[#e2dfd7] transition-all"
                title="Guest Menu"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-black/5 transition-all focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-[#eae8e3] overflow-hidden border-2 border-[#00696b] shadow-xs flex items-center justify-center text-[#00696b] relative">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
              <span className="hidden lg:inline text-xs font-bold text-[#1b1c19] max-w-[120px] truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'Traveler'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#6b7a7a] transition-transform duration-200 hidden sm:block ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}

          {/* Profile Dropdown Popup */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-xl border border-[#bac9c9]/40 p-3 z-50 animate-in slide-in-from-top-2 duration-200">
              {/* User Header Summary inside Dropdown */}
              <div
                onClick={() => handleNavClick('profile')}
                className="p-3 bg-[#f5f3ee] hover:bg-[#eae8e3] cursor-pointer rounded-2xl mb-2 flex items-center gap-3 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#00696b] text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-headline font-bold text-sm text-[#1b1c19] truncate">
                    {currentUser?.displayName || (currentUser ? 'Planzo Traveler' : 'Guest Explorer')}
                  </h4>
                  <p className="text-[11px] text-[#6b7a7a] truncate">
                    {currentUser?.email || 'Click to view profile'}
                  </p>
                  <span className="inline-block text-[10px] font-extrabold text-[#00696b] bg-[#00ced1]/20 px-2 py-0.5 rounded-full mt-1">
                    {currentUser ? 'Gold Explorer' : 'Guest Mode'}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavClick('profile')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    currentTab === 'profile'
                      ? 'bg-[#00696b]/10 text-[#00696b] font-bold'
                      : 'text-[#3b4949] hover:bg-[#f5f3ee]'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-[#00696b]" />
                  <span>My Profile & Preferences</span>
                </button>

                <button
                  onClick={() => handleNavClick('my-trips')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    currentTab === 'my-trips'
                      ? 'bg-[#00696b]/10 text-[#00696b] font-bold'
                      : 'text-[#3b4949] hover:bg-[#f5f3ee]'
                  }`}
                >
                  <Compass className="w-4 h-4 text-[#a43c12]" />
                  <span>My Saved Trips</span>
                </button>

                <button
                  onClick={() => handleNavClick('vibe-check')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                    currentTab === 'vibe-check'
                      ? 'bg-[#00696b]/10 text-[#00696b] font-bold'
                      : 'text-[#3b4949] hover:bg-[#f5f3ee]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#00696b]" />
                  <span>Vibe Check Generator</span>
                </button>

                <button
                  onClick={() => {
                    onToggleCalendar();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#3b4949] hover:bg-[#f5f3ee] flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#00696b]" />
                    <span>Google Calendar</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCalendarConnected ? 'bg-[#00ced1]/20 text-[#005354]' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCalendarConnected ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              <div className="my-2 border-t border-[#bac9c9]/30" />

              {/* Sign In / Out */}
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#a43c12] hover:bg-[#a43c12]/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#a43c12]" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onSignIn();
                  }}
                  className="w-full py-2.5 px-4 bg-[#00696b] hover:bg-[#005354] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
