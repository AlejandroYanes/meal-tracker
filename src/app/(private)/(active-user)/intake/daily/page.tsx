'use client';

import { useState } from 'react';
import { addDays, subDays } from 'date-fns';
import { type inferRouterOutputs } from '@trpc/server';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { keepPreviousData } from '@tanstack/query-core';

import { Button, Card, CardContent, CardHeader, CardTitle, DatePicker, ProgressCircle } from '@/ui';
import { api } from '@/trpc/react';
import { type AppRouter } from '@/server/api/root';
import MealCard from './__components/meal-card';

export default function IntakePage() {
  const [date, setDate] = useState(new Date());

  const { data: meals = [] } = api.meals.list.useQuery();
  const { data: records = [] } = api.intake.forDay.useQuery({ day: date }, { placeholderData: keepPreviousData });

  const {
    carbsRatio,
    proteinsRatio,
    fatsRatio,
  } = generateGoalsAndSums(meals, records);

  const goToPrevDay = () => {
    const nextDate = subDays(date, 1);
    setDate(nextDate);
  };

  const goToNextDay = () => {
    const nextDate = addDays(date, 1);
    setDate(nextDate);
  }

  return (
    <section className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Your Daily intake</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-row items-center justify-between">
          <div className="flex items-center justify-end gap-4">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <DatePicker date={date} defaultMonth={date} onChange={(__date) => setDate(__date!)} />
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <ProgressCircle variant="neutral" value={carbsRatio} radius={24}>
              <span title={`Carbs: ${carbsRatio}%`} className="text-xs font-medium text-gray-900 cursor-default">C</span>
            </ProgressCircle>
            <ProgressCircle variant="neutral" value={proteinsRatio} radius={24}>
              <span title={`Proteins: ${proteinsRatio}%`} className="text-xs font-medium text-gray-900 cursor-default">P</span>
            </ProgressCircle>
            <ProgressCircle variant="neutral" value={fatsRatio} radius={24}>
              <span title={`Fats: ${fatsRatio}%`} className="text-xs font-medium text-gray-900 cursor-default">F</span>
            </ProgressCircle>
          </div>
        </CardContent>
      </Card>
      {meals.map(meal => (
        <MealCard key={meal.id} meal={meal} day={date} />
      ))}
    </section>
  );
}

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
type Record = inferRouterOutputs<AppRouter>['intake']['forDay'][0];

function generateGoalsAndSums(meals: Meal[], records: Record[]) {
  let carbsTotals = 0;
  let carbsSum = 0;
  let proteinsTotals = 0;
  let proteinsSum = 0;
  let fatsTotals = 0;
  let fatsSum = 0;

  meals.forEach((meal) => {
    carbsTotals = carbsTotals + meal.carbs_goal;
    proteinsTotals = proteinsTotals + meal.proteins_goal;
    fatsTotals = fatsTotals + meal.fats_goal;
    const record = records.find((record) => record.meal_id === meal.id);

    if (record) {
      carbsSum = carbsSum + record.foods.reduce((sum, food) => sum + food.carbs, 0);
      proteinsSum = proteinsSum + record.foods.reduce((sum, food) => sum + food.proteins, 0);
      fatsSum = fatsSum + record.foods.reduce((sum, food) => sum + food.fats, 0);
    }
  });

  return {
    carbsTotals: carbsTotals.toFixed(1),
    carbsSum: Math.fround(carbsSum).toFixed(1),
    carbsRatio: Math.round(((carbsSum / carbsTotals) * 100)),
    proteinsTotals: proteinsTotals.toFixed(1),
    proteinsSum: Math.fround(proteinsSum).toFixed(1),
    proteinsRatio: Math.round(((proteinsSum / proteinsTotals) * 100)),
    fatsTotals: fatsTotals.toFixed(1),
    fatsSum: Math.fround(fatsSum).toFixed(1),
    fatsRatio: Math.round(((fatsSum / fatsTotals) * 100)),
  };
}
