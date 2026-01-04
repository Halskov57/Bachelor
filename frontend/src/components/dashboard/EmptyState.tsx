import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  onCreateProject: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">No projects yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Get started by creating your first project. You can add epics, features, and
        tasks to organize your work.
      </p>
      <Button onClick={onCreateProject} className="mt-6" size="lg">
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Project
      </Button>
    </div>
  );
}
