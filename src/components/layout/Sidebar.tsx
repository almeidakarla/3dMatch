'use client'

/**
 * SIDEBAR — Navigation component for the dashboard
 *
 * OLD CRA APPROACH:
 *   Used NavLink from react-router-dom with ({ isActive }) callback
 *   NavLink automatically added 'active' class based on route matching
 *
 * NEW NEXT.JS APPROACH:
 *   Uses Link from next/link + usePathname() from next/navigation
 *   We manually compare the current path to determine active state
 *   This is because Next.js doesn't have a NavLink equivalent
 */

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, User, Briefcase, FileText,
  MessageSquare, LogOut, Send, FolderOpen,
  Users, PlusCircle, Sun, Moon, Bell, BarChart, UserCheck, Award, Shield, Settings, BookOpen,
  type LucideIcon,
} from 'lucide-react'

interface MenuItem {
  path: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

interface SidebarProps {
  userType: string | undefined
  onSignOut: () => void
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function Sidebar({ userType, onSignOut, darkMode, toggleDarkMode }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const previousUserTypeRef = useRef(userType)

  useEffect(() => {
    if (previousUserTypeRef.current && previousUserTypeRef.current !== userType) {
      console.error('SIDEBAR WARNING: User type changed unexpectedly!', {
        previous: previousUserTypeRef.current,
        new: userType,
      })
    }
    previousUserTypeRef.current = userType
  }, [userType])

  const artistMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Home', icon: Home, exact: true },
    { path: '/dashboard/artist/projects', label: 'Active Projects', icon: FolderOpen },
    { path: '/dashboard/artist/past-projects', label: 'Project History', icon: BarChart },
    { path: '/dashboard/artist/browse-projects', label: 'Browse Projects', icon: Briefcase },
    { path: '/dashboard/artist/applications', label: 'My Applications', icon: Send },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    { path: '/dashboard/artist/profile', label: 'Profile', icon: User },
  ]

  const architectMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Home', icon: Home, exact: true },
    { path: '/dashboard/architect/projects', label: 'My Projects', icon: Briefcase },
    { path: '/dashboard/architect/past-projects', label: 'Project History', icon: BarChart },
    { path: '/dashboard/architect/browse-artists', label: 'Browse Artists', icon: Users },
    { path: '/dashboard/architect/post-project', label: 'Post Project', icon: PlusCircle },
    { path: '/dashboard/architect/applications', label: 'Applications Received', icon: FileText },
    { path: '/dashboard/architect/loyalty', label: 'Loyalty Program', icon: Award },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const adminMenuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Home', icon: Home, exact: true },
    { path: '/dashboard/admin/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/dashboard/admin/applications', label: 'Public Applications', icon: Shield },
    { path: '/dashboard/admin/profiles', label: 'Artist Profiles', icon: UserCheck },
    { path: '/dashboard/admin/blog', label: 'Blog Management', icon: BookOpen },
    { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const menuItems = userType === 'artista'
    ? artistMenuItems
    : userType === 'admin'
      ? adminMenuItems
      : architectMenuItems

  /**
   * Check if a menu item is active.
   * For exact routes (like /dashboard home), match exactly.
   * For others, check if the current path starts with the menu item path.
   */
  const isActive = (item: MenuItem): boolean => {
    if (item.exact) {
      return pathname === item.path
    }
    return pathname.startsWith(item.path)
  }

  const sidebarClass = isExpanded ? 'sidebar expanded' : 'sidebar'

  return (
    <div
      className={sidebarClass}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-logo">
        <img src="/icon-logo.svg" alt="3dMatch" className="logo-icon-img" />
        {isExpanded && <span className="logo-text">3dMatch</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              className={isActive(item) ? 'sidebar-item active' : 'sidebar-item'}
              title={!isExpanded ? item.label : ''}
            >
              <Icon size={20} />
              {isExpanded && <span className="sidebar-label">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-item"
          onClick={toggleDarkMode}
          title={!isExpanded ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && <span className="sidebar-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          type="button"
          className="sidebar-item"
          onClick={onSignOut}
          title={!isExpanded ? 'Sign Out' : ''}
        >
          <LogOut size={20} />
          {isExpanded && <span className="sidebar-label">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
