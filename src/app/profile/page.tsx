'use client'

import { SiteHeader } from '@/components/site-header'

export default function ProfilePage() {
  const handlePrevMonth = () => {
    // Handle previous month logic
    console.log('Previous month')
  }

  const handleNextMonth = () => {
    // Handle next month logic
    console.log('Next month')
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased selection:bg-secondary-container selection:text-on-secondary-container pb-24 md:pb-0">
      <SiteHeader />

      {/* Main Canvas */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-margin-mobile md:py-margin-desktop flex flex-col gap-8">
        {/* Profile Header (Bento Box) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar & Bio Card */}
          <div className="md:col-span-2 bg-surface-container border-2 border-on-background shadow-[6px_6px_0px_0px_#653d1e] p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            {/* Retro Corner Accent */}
            <div className="absolute top-0 right-0 w-4 h-4 bg-primary border-b-2 border-l-2 border-on-background"></div>

            {/* Avatar */}
            <div className="shrink-0 w-32 h-32 border-4 border-on-background bg-secondary-container shadow-[4px_4px_0px_0px_#653d1e]">
              <img
                alt="Avatar"
                className="w-full h-full object-cover pixelated opacity-90 sepia-[.3]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6L0s6aeIuzyt1pV3e2oQBbWpoP1G5MViDS4qEFlNcD9jYxklTQO7Q_61xsDiiP_7bvlTc9wGQzaQNRZVKo2GlkwJLSqyBxSdVbtRm8oGtR2M3yCbILzqGxlklUO-SqmotI9vAYcViHXqLJEoQBDQkxFqBWL1pwXW2Aq0Ae1RfgSC3JqHm0gwBDdTVi4angE01ShG68n1KrQ7hQSiSPVE8TsDcLfltG9uXVqN7xCMe5jcxAbFf5tSBWMJMMc9wTZ6l1BRxO5VM7lTx"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col text-center md:text-left">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">
                @ChronoWriter_99
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Level 42 Chronicler. Capturing analog memories in a digital wasteland. Slow-web
                enthusiast.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <span className="font-label-sm text-label-sm bg-secondary px-2 py-1 text-on-secondary border-2 border-on-background">
                  16-BIT DREAMER
                </span>
                <span className="font-label-sm text-label-sm bg-tertiary px-2 py-1 text-on-tertiary border-2 border-on-background">
                  RPG FAN
                </span>
              </div>
            </div>
          </div>

          {/* Stats Block (Inventory Style) */}
          <div className="md:col-span-1 grid grid-cols-2 gap-4">
            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-primary mb-2 text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                book
              </span>
              <span className="font-headline-md text-headline-md text-on-background">1,024</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                Entries
              </span>
            </div>

            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center">
              <span
                className="material-symbols-outlined text-secondary mb-2 text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span className="font-headline-md text-headline-md text-on-background">8,992</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">
                Reactions
              </span>
            </div>

            <div className="bg-surface-bright border-2 border-on-background shadow-[4px_4px_0px_0px_#653d1e] p-4 flex flex-col items-center justify-center text-center col-span-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">
                Current Streak
              </span>
              <div className="w-full bg-surface-variant h-4 border-2 border-on-background relative overflow-hidden mt-2">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-full bg-secondary w-3/4 border-r-2 border-on-background"></div>
              </div>
              <span className="font-label-sm text-label-sm text-on-background mt-2">
                42 Days / Next Unlock: 50
              </span>
            </div>
          </div>
        </section>

        {/* Journal Archive (Inventory Grid) */}
        <section className="mt-4 flex flex-col gap-4">
          <div className="flex justify-between items-end border-b-4 border-on-background pb-2">
            <h2 className="font-headline-md text-headline-md text-on-background uppercase tracking-tight">
              Memory Inventory
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="btn-retro p-1 border-2 border-on-background bg-surface shadow-[2px_2px_0px_0px_#1e1b16]"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_left</span>
              </button>
              <span className="font-label-lg text-label-lg self-center px-2">OCT 199X</span>
              <button
                onClick={handleNextMonth}
                className="btn-retro p-1 border-2 border-on-background bg-surface shadow-[2px_2px_0px_0px_#1e1b16]"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_right</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-container border-4 border-on-background shadow-[8px_8px_0px_0px_#653d1e] p-4 md:p-6">
            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2 text-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">S</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">M</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">T</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">W</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">T</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">F</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">S</span>
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {/* Blank cells for start of month */}
              <div className="aspect-square bg-surface border-2 border-surface-variant inset-shadow"></div>
              <div className="aspect-square bg-surface border-2 border-surface-variant inset-shadow"></div>
              <div className="aspect-square bg-surface border-2 border-surface-variant inset-shadow"></div>

              {/* Day 1 - Active */}
              <button className="btn-retro aspect-square bg-secondary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-secondary-fixed-dim transition-colors relative">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  1
                </span>
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontSize: '16px' }}
                >
                  edit_square
                </span>
              </button>

              {/* Day 2 - Active */}
              <button className="btn-retro aspect-square bg-primary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-primary-fixed-dim transition-colors relative">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  2
                </span>
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: '16px' }}
                >
                  photo_library
                </span>
              </button>

              {/* Day 3 - Empty */}
              <div className="aspect-square bg-surface border-2 border-outline/30 inset-shadow relative">
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute top-1 right-1">
                  3
                </span>
              </div>

              {/* Day 4 - Active */}
              <button className="btn-retro aspect-square bg-secondary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-secondary-fixed-dim transition-colors relative">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  4
                </span>
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontSize: '16px' }}
                >
                  edit_square
                </span>
              </button>

              {/* Day 5 - Active */}
              <button className="btn-retro aspect-square bg-tertiary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-tertiary-fixed-dim transition-colors relative">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  5
                </span>
                <span
                  className="material-symbols-outlined text-tertiary"
                  style={{ fontSize: '16px' }}
                >
                  star
                </span>
              </button>

              {/* Day 6 - Empty */}
              <div className="aspect-square bg-surface border-2 border-outline/30 inset-shadow relative">
                <span className="font-label-sm text-label-sm text-on-surface-variant absolute top-1 right-1">
                  6
                </span>
              </div>

              {/* Day 7 - Active */}
              <button className="btn-retro aspect-square bg-secondary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-secondary-fixed-dim transition-colors relative">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  7
                </span>
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontSize: '16px' }}
                >
                  edit_square
                </span>
              </button>

              {/* Day 8 - Today */}
              <button className="btn-retro aspect-square bg-primary-container border-2 border-on-background flex flex-col items-center justify-center hover:bg-primary-fixed-dim transition-colors relative shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <span className="font-label-sm text-label-sm text-on-background absolute top-1 right-1">
                  8
                </span>
                <div className="absolute inset-0 border-2 border-primary animate-pulse"></div>
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontSize: '16px' }}
                >
                  edit_square
                </span>
              </button>

              {/* Future empty days */}
              {[9, 10, 11, 12, 13, 14, 15].map((day) => (
                <div
                  key={day}
                  className="aspect-square bg-surface border-2 border-surface-variant inset-shadow relative"
                >
                  <span className="font-label-sm text-label-sm text-on-surface-variant absolute top-1 right-1">
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface border-t-4 border-on-background pb-safe pt-2">
        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="/feed"
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Feed</span>
        </a>

        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="/journal"
        >
          <span className="material-symbols-outlined">edit_square</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Journal</span>
        </a>

        <a
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-secondary-container dark:hover:bg-secondary-fixed-dim"
          href="#"
        >
          <span className="material-symbols-outlined">photo_library</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Memories</span>
        </a>

        {/* Active Tab */}
        <a
          className="flex flex-col items-center justify-center bg-primary text-on-primary border-2 border-on-background p-1 translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-95 transition-transform"
          href="/profile"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm uppercase mt-1">Profile</span>
        </a>
      </nav>
    </div>
  )
}
