'use client'

import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setMobileSidebarOpen } from '../store/slices/uiSlice'
import { ReduxAppBar } from './ReduxAppBar'
import { ReduxSidebar } from './ReduxSidebar'

interface ReduxLayoutProps {
  children: React.ReactNode
}

export function ReduxLayout({ children }: ReduxLayoutProps) {
  const dispatch = useAppDispatch()
  const { mobileSidebarOpen } = useAppSelector((state) => state.ui)

  const handleMobileSidebarClose = () => {
    dispatch(setMobileSidebarOpen(false))
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <ReduxAppBar />
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleMobileSidebarClose} />
        <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-white dark:bg-gray-800 shadow-xl">
          <ReduxSidebar onClose={handleMobileSidebarClose} />
        </div>
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:top-16 lg:left-0 lg:z-40 lg:w-60 lg:block">
        <div className="h-full bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <ReduxSidebar />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 lg:pl-60 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
