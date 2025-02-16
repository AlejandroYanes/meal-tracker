'use client';
import { useState } from 'react';
import type { inferRouterOutputs } from '@trpc/server';
import { keepPreviousData } from '@tanstack/query-core';
import { NotebookPenIcon } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';
import AddMealRecord from '@/app/(private)/(active-user)/intake/daily/__components/add-meal-record';

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];

interface Props {
  day: Date;
  meal: Meal;
}

export default function MealCard(props: Props) {
  const { day, meal } = props;
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: intakeRecords = [] } = api.intake.forDay.useQuery({ day }, {
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const recordsForMeal = intakeRecords.find((intake) => intake.meal_id === meal.id);
  const foodRecords = recordsForMeal?.foods ?? [];

  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{meal.name}</CardTitle>
        <Button variant="link" onClick={() => setShowAddModal(true)}>
          <NotebookPenIcon className="w-4 h-4 mr-2" />
          Add food record
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28 text-center">Carbs</TableHead>
              <TableHead className="w-28 text-center">Proteins</TableHead>
              <TableHead className="w-28 text-center">Fats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {foodRecords.map((food) => (
              <TableRow key={food.id}>
                <TableCell>{food.name}</TableCell>
                <TableCell className="w-28 text-center">{food.carbs}</TableCell>
                <TableCell className="w-28 text-center">{food.proteins}</TableCell>
                <TableCell className="w-28 text-center">{food.fats}</TableCell>
              </TableRow>
            ))}
            {foodRecords.length === 0 ? (
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
