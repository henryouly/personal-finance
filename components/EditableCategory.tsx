'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';

interface EditableCategoryProps {
  category: string;
  onCategoryChange: (newCategory: string) => void;
  className?: string;
}

export function EditableCategory({
  category,
  onCategoryChange,
  className
}: EditableCategoryProps) {
  const trpc = useTRPC();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const { data: categories, isLoading, error } = useQuery(trpc.categories.list.queryOptions());;

  const handleCategorySelect = (newCategory: string) => {
    setSelectedCategory(newCategory);
    onCategoryChange(newCategory);
    // TODO: Send update to database here in a follow-up
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
            'bg-blue-100 text-blue-800 hover:bg-blue-200',
            className
          )}
        >
          {selectedCategory}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2">
        {isLoading ? (
          <div className="px-2 py-1.5 text-sm text-gray-500">Loading categories...</div>
        ) : error ? (
          <div className="px-2 py-1.5 text-sm text-red-500">Error loading categories</div>
        ) : categories ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer',
                  'bg-blue-100 text-blue-800 hover:bg-blue-200',
                  selectedCategory === category.name && 'ring-2 ring-blue-500'
                )}
                onClick={() => handleCategorySelect(category.name)}
              >
                {category.name}
              </DropdownMenuItem>
            ))}
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
