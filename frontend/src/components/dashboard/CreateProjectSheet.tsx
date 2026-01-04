import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import EditFanout from '../EditFanout';

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectSheetProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    onProjectCreated();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Fill in the details below to create a new project.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <EditFanout 
            mode="create"
            createNode={{
              type: 'project',
              parentIds: {}
            }}
            onClose={handleClose} 
            onSave={handleSave} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
