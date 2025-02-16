'use client';
import { useState } from 'react';
import { EllipsisVerticalIcon, InfoIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';
import { type inferRouterOutputs } from '@trpc/server';

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui';
import { api } from '@/trpc/react';
import { type AppRouter } from '@/server/api/root';
import { formatCurrency } from '@/utils/numbers';
import AddFood from './__components/add-food';
import FoodModal from './__components/food-modal';
import DeleteFoodModal from './__components/delete-food-modal';

type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

export default function MealsPage() {
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [deletingFood, setDeletingFood] = useState<Food | null>(null);

  const { data: foods = [], isLoading } = api.food.list.useQuery();

  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>Your groceries</CardTitle>
          <CardDescription>
            A list of all the food commonly eat and want to track
          </CardDescription>
        </div>
        <AddFood />
      </CardHeader>
      <CardContent className="pt-6">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Amount</TableHead>
              <TableHead className="w-28 text-center">price</TableHead>
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
            {!isLoading && foods.length === 0 ? <EmptyRow /> : null}
            {foods.map((food) => (
              <TableRow key={food.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{food.name}</span>
                      {food.notes ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoIcon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-80">
                              <p>{food.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                    </div>
                    <span className="text-sm text-muted-foreground">{food.description}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{`${food.amount} ${food.unit}`}</TableCell>
                <TableCell className="text-center">{formatCurrency(food.price, 'gbp')}</TableCell>
                <TableCell className="text-center">{food.carbs}</TableCell>
                <TableCell className="text-center">{food.proteins}</TableCell>
                <TableCell className="text-center">{food.fats}</TableCell>
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
                      <DropdownMenuItem onClick={() => setEditingFood(food)}>
                        <PencilLineIcon className="h-4 w-4 mr-2"/>
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingFood(food)}>
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
        {editingFood ? <FoodModal isEditing itemId={editingFood.id} defaultValues={editingFood} onClose={() => setEditingFood(null)} /> : null}
        {deletingFood ? <DeleteFoodModal food={deletingFood} onClose={() => setDeletingFood(null)} /> : null}
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
