'use client';
import { useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import { NotebookPenIcon } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle, Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';
import { generateGoalsAndSums, normaliseExchanges } from '@/utils/exchanges';
import GoalRing from '@/components/goal-ring';
import AddMealRecord from './add-meal-record';

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];

interface Props {
  day: Date;
  meal: Meal;
}

export default function MealCard(props: Props) {
  const { day, meal } = props;
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: intakeRecords = [], isLoading } = api.intake.forDay.useQuery({ day }, { refetchOnMount: false });

  const recordsForMeal = intakeRecords.find((intake) => intake.meal_id === meal.id);
  const foodRecords = recordsForMeal?.foods ?? [];

  const goalsAndSums = recordsForMeal
    ? generateGoalsAndSums([recordsForMeal])
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
          <GoalRing label="Carbs" ratio={goalsAndSums.carbsRatio} sum={goalsAndSums.carbsSum} total={goalsAndSums.carbsTotals} />
          <GoalRing label="Proteins" ratio={goalsAndSums.proteinsRatio} sum={goalsAndSums.proteinsSum} total={goalsAndSums.proteinsTotals} />
          <GoalRing label="Fats" ratio={goalsAndSums.fatsRatio} sum={goalsAndSums.fatsSum} total={goalsAndSums.fatsTotals} />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {foodRecords.map((food) => {
              const { carbs, proteins, fats } = normaliseExchanges(food);
              return (
                <TableRow key={food.id}>
                  <TableCell>{food.name}</TableCell>
                  <TableCell className="w-28 text-center">{food.amount_consumed}{food.unit === 'piece' ? ` ${food.unit}` : food.unit}</TableCell>
                  <TableCell className="w-28 text-center">{carbs}</TableCell>
                  <TableCell className="w-28 text-center">{proteins}</TableCell>
                  <TableCell className="w-28 text-center">{fats}</TableCell>
                </TableRow>
              )
            })}
            {isLoading ? <SkeletonRows /> : null}
            {!isLoading && foodRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No records yet...
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        {showAddModal ? (
          <AddMealRecord meal={meal} day={day} onClose={() => setShowAddModal(false)} />
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
