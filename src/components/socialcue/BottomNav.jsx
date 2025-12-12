import React from 'react';

function BottomNav({ currentScreen, onNavigate, darkMode, navItems, newGoalsCount = 0 }) {
  // Helper to determine if a nav item is active
  const isItemActive = (itemId) => {
    // Direct match
    if (currentScreen === itemId) return true;

    // Lessons tab should highlight during lesson sessions
    if (itemId === 'lessons' && currentScreen === 'lessonSession') {
      return true;
    }

    // Practice screen variations (voice practice only)
    if (itemId === 'practice' && currentScreen === 'practiceHome') {
      return true;
    }

    // Avatar builder
    if (itemId === 'avatar-builder' && currentScreen === 'avatar-builder') {
      return true;
    }

    return false;
  };

  // Helper to get the navigation target for an item
  const getNavigationTarget = (itemId) => {
    if (itemId === 'practice') return 'practiceHome';
    return itemId;
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 ${
      darkMode ? 'bg-black/95 border-white/10' : 'bg-white/95 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-around py-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);

            // Special styling for Avatar tab when active
            const isAvatarTab = item.id === 'avatar-builder';
            const activeClasses = isAvatarTab && isActive
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
              : isActive
              ? 'bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30'
              : darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100';

            const activeTextColor = isAvatarTab && isActive
              ? 'text-purple-400'
              : isActive
              ? 'text-emerald-400'
              : darkMode ? 'text-gray-400' : 'text-gray-600';

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(getNavigationTarget(item.id))}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${activeClasses}`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${activeTextColor}`} />
                  {item.id === 'goals' && newGoalsCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {newGoalsCount}
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold ${activeTextColor}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;