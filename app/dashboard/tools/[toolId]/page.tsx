import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { TOOL_CATEGORIES } from '@/lib/tools-config';
import ToolClient from './ToolClient';

export default async function ToolPage({ params }: { params: { toolId: string } }) {
  const user = await getSession();

  if (!user) {
    redirect('/auth/login');
  }

  const tool = TOOL_CATEGORIES.flatMap(c => c.tools).find(t => t.id === params.toolId);

  if (!tool) {
    redirect('/dashboard');
  }

  return <ToolClient user={user} tool={tool} />;
}
