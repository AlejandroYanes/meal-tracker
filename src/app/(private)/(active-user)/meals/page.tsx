'use client';
import { useState } from 'react';
import { EllipsisVerticalIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import type { inferRouterOutputs } from '@trpc/server';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';
import AddMeal from './__components/add-meal';
import MealModal from './__components/meal-modal';
import DeleteMealModal from './__components/delete-meal-modal';

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
export default function MealsPage() {
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);

  const { data: meals = [], isLoading } = api.meals.list.useQuery();
  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Your meals</CardTitle>
          <CardDescription>
            These are your daily meals.
          </CardDescription>
        </div>
        <AddMeal />
      </CardHeader>
      <CardContent className="pt-6">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Carbs</TableHead>
              <TableHead className="w-28 text-center">Proteins</TableHead>
              <TableHead className="w-28 text-center">Fats</TableHead>
              <TableHead className="w-28 text-center">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : null}
            {!isLoading && meals.length === 0 ? <EmptyRow /> : null}
            {meals.map((meal) => (
              <TableRow key={meal.id}>
                <TableCell>
                  {meal.name}
                </TableCell>
                <TableCell className="text-center">{meal.carbs_goal}</TableCell>
                <TableCell className="text-center">{meal.proteins_goal}</TableCell>
                <TableCell className="text-center">{meal.fats_goal}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <EllipsisVerticalIcon className="h-4 w-4"/>
                        <span className="sr-only">Toggle actions menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-40">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingMeal(meal)}>
                        <PencilLineIcon className="h-4 w-4 mr-2"/>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingMeal(meal)}>
                        <Trash2Icon className="h-4 w-4 mr-2"/>
                        <span>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingMeal ? <MealModal isEditing itemId={editingMeal.id} defaultValues={editingMeal} onClose={() => setEditingMeal(null)} /> : null}
        {deletingMeal ? <DeleteMealModal meal={deletingMeal} onClose={() => setDeletingMeal(null)} /> : null}
      </CardContent>
    </Card>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5" />
      </TableCell>
    </TableRow>
  );
}

function EmptyRow() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6">
        {`Let's`} get you started, add some food to track...
      </TableCell>
    </TableRow>
  );
}
