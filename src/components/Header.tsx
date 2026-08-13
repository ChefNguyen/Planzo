import React, { useState, useRef, useEffect } from 'react';
import { PlanzoLogo } from './PlanzoLogo';
import {
  Calendar,
  CheckCircle2,
  User as UserIcon,
  Compass,
  Sparkles,
  LogOut,
  ChevronDown,
  ExternalLink,
  Unlink,
} from 'lucide-react';
import { getGoogleCalendarUrl } from '../lib/googleCalendar';
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
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const calendarMenuRef = useRef<HTMLDivElement>(null);

  // Reset image error state when current user or photoURL changes
  useEffect(() => {
    setImgError(false);
  }, [currentUser?.photoURL]);

  // Compute user initial for fallback avatar badge
  const userInitial = currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase()
    : currentUser?.email
      ? currentUser.email.charAt(0).toUpperCase()
      : 'T';

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (calendarMenuRef.current && !calendarMenuRef.current.contains(event.target as Node)) {
        setIsCalendarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tab: string) => {
    onSelectTab(tab);
    setIsDropdownOpen(false);
  };

  const NAV_ITEMS = [
    { id: 'explore', label: 'Explore' },
    { id: 'my-trips', label: 'My Trips' },
    { id: 'community', label: 'Community' },
    { id: 'vibe-check', label: 'Vibe Check' },
  ];

  return (
    <>
      {/* Top Scroll Mask Shield */}
      <div className="fixed top-0 left-0 w-full h-3 z-50 bg-[#fbf9f4] pointer-events-none transition-colors duration-300" />

      <header className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1400px] h-16 z-50 rounded-none bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] px-6 sm:px-8 transition-all duration-300 flex justify-between items-center text-[#1b1c19]">
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 md:gap-10">
          <button
            onClick={() => handleNavClick('explore')}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#00696b] font-headline hover:opacity-90 transition-opacity flex items-center gap-1.5 group"
          >
            <PlanzoLogo className="w-8 h-8 sm:w-9 sm:h-9 transition-transform group-hover:scale-110 group-hover:-rotate-6" color="#00696b" />
            <span>Planzo</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 sm:gap-2 ml-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-2 rounded-none font-headline text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 ${isActive
                    ? 'bg-[#00696b] text-white border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]'
                    : 'text-[#3b4949] border-2 border-transparent hover:border-[#1b1c19] hover:bg-[#f5f3ee]'
                    }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 bg-white shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Calendar Connection Control & Popover */}
          <div className="hidden sm:flex relative" ref={calendarMenuRef}>
            <button
              onClick={() => {
                if (isCalendarConnected) {
                  setIsCalendarMenuOpen(!isCalendarMenuOpen);
                } else {
                  onToggleCalendar();
                }
              }}
              className={`text-xs font-headline font-black uppercase tracking-wider flex items-center gap-1.5 px-3.5 py-1.5 rounded-none border-2 border-[#1b1c19] transition-all ${isCalendarConnected
                ? 'bg-[#00ced1]/20 text-[#00696b] shadow-[2px_2px_0px_0px_#00696b] hover:-translate-y-0.5'
                : 'bg-white text-[#6b7a7a] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-[#f5f3ee]'
                }`}
              title="Manage Google Calendar Connection"
            >
              <Calendar className="w-3.5 h-3.5 text-[#00696b]" />
              <span>{isCalendarConnected ? 'Calendar Connected' : 'Connect Calendar'}</span>
              {isCalendarConnected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00696b] ml-0.5" />}
            </button>

            {/* Calendar Popover Menu */}
            {isCalendarMenuOpen && isCalendarConnected && (
              <div className="absolute right-0 top-12 w-72 bg-[#ffffff] border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150 rounded-none text-[#1b1c19]">
                {/* Active Account Status Card */}
                <div className="p-3 bg-[#00ced1]/15 border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 bg-[#00696b] border border-[#1b1c19] shrink-0" />
                    <p className="text-xs font-headline font-black text-[#00696b] uppercase tracking-wider">
                      Google Calendar Active
                    </p>
                  </div>
                  <p className="text-[11px] text-[#3b4949] font-bold truncate">
                    {sessionStorage.getItem('gcal_account_email') || currentUser?.email || 'Auto-Sync Active'}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <a
                    href={getGoogleCalendarUrl()}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsCalendarMenuOpen(false)}
                    className="w-full px-3.5 py-2.5 bg-white hover:bg-[#00696b] text-[#00696b] hover:text-white border-2 border-[#1b1c19] shadow-[2.5px_2.5px_0px_0px_#1b1c19] font-headline font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none"
                  >
                    <span>Open Google Calendar</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setIsCalendarMenuOpen(false);
                      onToggleCalendar();
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a] text-[#ba1a1a] hover:text-white border-2 border-[#1b1c19] shadow-[2.5px_2.5px_0px_0px_#ba1a1a] font-headline font-black text-xs uppercase tracking-wider flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 rounded-none"
                  >
                    <span>Disconnect Calendar</span>
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {!currentUser ? (
              <button
                onClick={onSignIn}
                className="bg-[#00696b] text-white px-4 sm:px-5 py-2 rounded-none font-headline font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#1b1c19] active:translate-x-0 active:translate-y-0 transition-all flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 bg-white border-2 border-[#1b1c19] shadow-[2.5px_2.5px_0px_0px_#1b1c19] hover:-translate-y-0.5 transition-all focus:outline-none rounded-none"
              >
                <div className="w-9 h-9 bg-[#00696b] text-white border-2 border-[#1b1c19] overflow-hidden flex items-center justify-center font-headline font-black text-sm relative rounded-none">
                  {currentUser.photoURL && !imgError ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User avatar"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#1b1c19] transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}

            {/* Profile Dropdown Popup */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#ffffff] rounded-none shadow-[6px_6px_0px_0px_#1b1c19] border-2 border-[#1b1c19] p-4 z-50 animate-in slide-in-from-top-2 duration-200 text-[#1b1c19]">
                {/* User Header Summary inside Dropdown */}
                <div
                  onClick={() => handleNavClick('profile')}
                  className="p-3.5 bg-[#f5f3ee] hover:bg-[#00ced1]/15 cursor-pointer rounded-none border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] mb-3 flex items-center gap-3 transition-all hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 rounded-none bg-[#00696b] text-white border-2 border-[#1b1c19] flex items-center justify-center font-bold overflow-hidden shrink-0 shadow-[2px_2px_0px_0px_#1b1c19]">
                    {currentUser?.photoURL && !imgError ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Avatar"
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-headline font-extrabold text-base text-white">
                        {userInitial}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-headline font-black text-sm text-[#1b1c19] truncate">
                      {currentUser?.displayName || (currentUser ? 'Planzo Traveler' : 'Guest Explorer')}
                    </h4>
                    <p className="text-[11px] text-[#6b7a7a] font-medium truncate">
                      {currentUser?.email || 'Click to view profile'}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-none font-headline font-black text-xs uppercase tracking-wider flex items-center gap-3 transition-all border-2 border-[#1b1c19] ${
                      currentTab === 'profile'
                        ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                        : 'bg-white text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-[#f5f3ee] hover:-translate-x-0.5'
                    }`}
                  >
                    <UserIcon className={`w-4 h-4 ${currentTab === 'profile' ? 'text-white' : 'text-[#00696b]'}`} />
                    <span>My Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('my-trips')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-none font-headline font-black text-xs uppercase tracking-wider flex items-center gap-3 transition-all border-2 border-[#1b1c19] ${
                      currentTab === 'my-trips'
                        ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                        : 'bg-white text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-[#f5f3ee] hover:-translate-x-0.5'
                    }`}
                  >
                    <Compass className={`w-4 h-4 ${currentTab === 'my-trips' ? 'text-white' : 'text-[#a43c12]'}`} />
                    <span>My Saved Trips</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('vibe-check')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-none font-headline font-black text-xs uppercase tracking-wider flex items-center gap-3 transition-all border-2 border-[#1b1c19] ${
                      currentTab === 'vibe-check'
                        ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                        : 'bg-white text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-[#f5f3ee] hover:-translate-x-0.5'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${currentTab === 'vibe-check' ? 'text-white' : 'text-[#00696b]'}`} />
                    <span>Vibe Check Generator</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onToggleCalendar();
                    }}
                    className="w-full text-left px-3.5 py-2.5 bg-white text-[#1b1c19] border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] flex items-center justify-between font-headline font-black text-xs uppercase tracking-wider hover:bg-[#f5f3ee] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#00696b]" />
                      <span>Google Calendar</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-none border-2 border-[#1b1c19] shadow-[1.5px_1.5px_0px_0px_#1b1c19] ${
                        isCalendarConnected ? 'bg-[#00ced1] text-[#1b1c19]' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isCalendarConnected ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                <div className="my-3 border-t-2 border-[#1b1c19]/20" />

                {/* Sign In / Out */}
                {currentUser ? (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-none font-headline font-black text-xs uppercase tracking-wider text-[#ba1a1a] hover:text-white bg-[#ba1a1a]/10 hover:bg-[#ba1a1a] border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#ba1a1a] flex items-center justify-between transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </div>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignIn();
                    }}
                    className="w-full py-2.5 px-4 font-headline font-black uppercase text-xs rounded-none flex items-center justify-center gap-2 border-2 border-[#1b1c19] bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
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
    </>
  );
};
