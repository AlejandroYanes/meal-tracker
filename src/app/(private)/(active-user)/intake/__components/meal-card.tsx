'use client';
import { useState } from 'react';
import { EllipsisVerticalIcon, NotebookPenIcon, PencilLineIcon, Trash2Icon } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { generateGoalsAndSums, normaliseExchanges } from '@/utils/meal-intakes';
import GoalRing from '@/components/goal-ring';
import FoodIntakeModal from './food-intake-modal';
import DeleteFoodIntakeModal from '@/app/(private)/(active-user)/intake/__components/delete-food-intake-modal';

interface Props {
  day: Date;
  meal: { id: number; name: string };
}

export default function MealCard(props: Props) {
  const { day, meal } = props;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFoodIntake, setEditingFoodIntake] = useState<{ id: number; food_id: number; amount: number } | null>(null);
  const [deletingFoodIntake, setDeletingFoodIntake] = useState<number | null>(null);

  const { data: intakeRecords = [], isLoading } = api.intake.forDay.useQuery({ day }, { refetchOnMount: false });

  const recordsForMeal = intakeRecords.find((intake) => intake.meal_id === meal.id);
  const foodRecords = recordsForMeal?.foods ?? [];

  const goalsAndSums = recordsForMeal
    ? generateGoalsAndSums([recordsForMeal], day)
    : {
      carbsTotals: '0',
      carbsSum: '0',
      carbsRatio: 0,
      proteinsTotals: '0',
      proteinsSum: '0',
      proteinsRatio: 0,
      fatsTotals: '0',
      fatsSum: '0',
      fatsRatio: 0,
    };

  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{meal.name}</CardTitle>
        <div className="flex items-center gap-4">
          <GoalRing
            label="Carbs"
            ratio={goalsAndSums.carbsRatio}
            sum={goalsAndSums.carbsSum}
            total={goalsAndSums.carbsTotals}
          />
          <GoalRing
            label="Proteins"
            ratio={goalsAndSums.proteinsRatio}
            sum={goalsAndSums.proteinsSum}
            total={goalsAndSums.proteinsTotals}
          />
          <GoalRing
            label="Fats"
            ratio={goalsAndSums.fatsRatio}
            sum={goalsAndSums.fatsSum}
            total={goalsAndSums.fatsTotals}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Button variant="link" className="ml-auto" onClick={() => setShowAddModal(true)}>
          <NotebookPenIcon className="w-4 h-4 mr-2" />
          Add food record
        </Button>
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Amount</TableHead>
              <TableHead className="w-28 text-center">Carbs</TableHead>
              <TableHead className="w-28 text-center">Proteins</TableHead>
              <TableHead className="w-28 text-center">Fats</TableHead>
              <TableHead className="w-20">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foodRecords.map((record) => {
              const { carbs, proteins, fats } = normaliseExchanges(record);
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell className="w-28 text-center">
                    {record.amount_consumed}{record.unit === 'piece' ? ` ${record.unit}` : record.unit}
                  </TableCell>
                  <TableCell className="w-28 text-center">{carbs}</TableCell>
                  <TableCell className="w-28 text-center">{proteins}</TableCell>
                  <TableCell className="w-28 text-center">{fats}</TableCell>
                  <TableCell className="w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mx-auto">
                          <EllipsisVerticalIcon className="h-4 w-4 mr-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-40" side="bottom" align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingFoodIntake({
                              id: record.id,
                              food_id: record.food_id,
                              amount: record.amount_consumed,
                            });
                          }}
                        >
                          <PencilLineIcon className="w-4 h-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingFoodIntake(record.id)}>
                          <Trash2Icon className="w-4 h-4 mr-2" />
                          <span>Remove</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {isLoading ? <SkeletonRows /> : null}
            {!isLoading && foodRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No records yet...
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        {showAddModal ? (
          <FoodIntakeModal meal={meal} day={day} onClose={() => setShowAddModal(false)} />
        ) : null}
        {editingFoodIntake ? (
          <FoodIntakeModal
            meal={meal}
            day={day}
            itemId={editingFoodIntake.id}
            initialValues={{ food_id: editingFoodIntake.food_id, amount: editingFoodIntake.amount }}
            onClose={() => setEditingFoodIntake(null)}
          />
        ) : null}
        {deletingFoodIntake ? (
          <DeleteFoodIntakeModal itemId={deletingFoodIntake} day={day} onClose={() => setDeletingFoodIntake(null)} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function SkeletonRows() {
  return (
    <>
      <TableRow>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
      </TableRow>
      <TableRow>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
      </TableRow>
      <TableRow>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
      </TableRow>
      <TableRow>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
        <TableCell><Skeleton className="h-5" /></TableCell>
      </TableRow>
    </>
  );
}
