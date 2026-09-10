'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '../lib/store';
import { CATEGORIES } from '../lib/config';

export default function Sidebar() {
  const { currentUser } = useApp();
  const pathname = usePathname();

  const visibleCategories = CATEGORIES
    .map(c => ({ ...c, items: c.items.filter(i => i.roles.includes(currentUser.role)) }))
    .filter(c => c.items.length > 0);

  const activeCat = visibleCategories.find(c => c.items.some(i => i.path === pathname)) || visibleCategories[0];

  return (
    <>
      <div className="rail">
        <Link href="/desktop" className="rail-logo" title="Go to Home">
          <Image src="/logo.png" alt="Talent360" width={96} height={96} priority />
        </Link>
        {visibleCategories.map(c => (
          <Link key={c.id} href={c.items[0].path} className={`rail-item ${c.id === activeCat.id ? 'active' : ''}`} style={{textDecoration:'none'}}>
            <span className="ricon"></span><span>{c.label}</span>
          </Link>
        ))}
      </div>
      <div className="subpanel">
        <h4>{activeCat.label}</h4>
        {activeCat.items.map(i => (
          <Link key={i.v} href={i.path} className={`subitem ${pathname === i.path ? 'active' : ''}`} style={{textDecoration:'none', display:'block'}}>
            {i.label}
          </Link>
        ))}
      </div>
    </>
  );
}
