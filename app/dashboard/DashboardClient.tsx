'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/types';
import { TOOL_CATEGORIES } from '@/lib/tools-config';
import {
  FileText,
  LogOut,
  Settings,
  User as UserIcon,
  Crown,
  BarChart3
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  user: User;
}

export default function DashboardClient({ user }: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const filteredTools = selectedCategory
    ? TOOL_CATEGORIES.filter(cat => cat.id === selectedCategory)
    : TOOL_CATEGORIES;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">DocProcess</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <Crown className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-sm">{user.subscriptionPlan}</span>
              </div>

              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>

              <Link
                href="/dashboard/settings"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Files Processed"
            value="127"
            icon={<FileText className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="This Month"
            value="42"
            icon={<BarChart3 className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Storage Used"
            value="2.4 GB"
            icon={<Icons.HardDrive className="w-6 h-6 text-purple-600" />}
          />
          <StatCard
            title="Plan"
            value={user.subscriptionPlan}
            icon={<Crown className="w-6 h-6 text-yellow-600" />}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Tools
          </button>
          {TOOL_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="space-y-8">
          {filteredTools.map((category) => (
            <div key={category.id}>
              <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.tools.map((tool) => {
                  const isPlanAllowed =
                    (user.subscriptionPlan === 'FREE' && tool.freePlan) ||
                    (user.subscriptionPlan === 'PRO' && tool.proPlan) ||
                    (user.subscriptionPlan === 'ENTERPRISE' && tool.enterprisePlan);

                  return (
                    <Link
                      key={tool.id}
                      href={isPlanAllowed ? `/dashboard/tools/${tool.id}` : '#'}
                      className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 ${
                        isPlanAllowed
                          ? 'border-transparent hover:border-blue-200'
                          : 'border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        if (!isPlanAllowed) {
                          e.preventDefault();
                          toast.error('Upgrade your plan to use this tool');
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                          <p className="text-sm text-gray-600">{tool.description}</p>
                        </div>
                        {!isPlanAllowed && (
                          <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
