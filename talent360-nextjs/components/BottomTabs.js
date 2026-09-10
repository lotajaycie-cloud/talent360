'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../lib/store';
import { CATEGORIES } from '../lib/config';

// Mobile-only navigation. The left rail + subpanel are hidden below 860px (see
// globals.css) and replaced by this: one tab per visible category, with a
// slide-up sheet for categories holding more than one module. Fewer taps than a
// hamburger and matches how native apps handle this.
export default function BottomTabs() {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const [openCat, setOpenCat] = useState(null);

  const visibleCategories = CATEGORIES
    .map(c => ({ ...c, items: c.items.filter(i => i.roles.includes(currentUser.role)) }))
    .filter(c => c.items.length > 0);

  const activeCat = visibleCategories.find(c => c.items.some(i => i.path === pathname)) || visibleCategories[0];
  const sheetCat = openCat ? visibleCategories.find(c => c.id === openCat) : null;

  function closeSheet() { setOpenCat(null); }

  return (
    <>
      {sheetCat && <div className="mobile-nav-overlay" onClick={closeSheet}></div>}

      <div className={`mobile-sheet ${sheetCat ? 'open' : ''}`}>
        <div className="sheet-grabber"></div>
        {sheetCat && (
          <>
            <div className="sheet-title">{sheetCat.label}</div>
            <div>
              {sheetCat.items.map(i => (
                <Link
                  key={i.v}
                  href={i.path}
                  className={`sheet-item ${pathname === i.path ? 'active' : ''}`}
                  onClick={closeSheet}
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bottom-tabs">
        {visibleCategories.map(c => {
          const isActive = c.id === activeCat?.id;
          // Single-module categories navigate directly; multi-module ones open the sheet.
          if (c.items.length === 1) {
            return (
              <Link
                key={c.id}
                href={c.items[0].path}
                className={`tab-item ${isActive ? 'active' : ''}`}
                onClick={closeSheet}
                style={{ textDecoration: 'none' }}
              >
                <span className="tab-dot"></span>
                <span>{c.label}</span>
              </Link>
            );
          }
          return (
            <button
              key={c.id}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpenCat(openCat === c.id ? null : c.id)}
            >
              <span className="tab-dot"></span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
