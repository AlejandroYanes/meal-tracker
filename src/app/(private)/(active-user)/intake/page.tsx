'use client';

import { useState } from 'react';
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import { type inferRouterOutputs } from '@trpc/server';

import { Skeleton, Tabs, TabsList, TabsTrigger } from '@/ui';
import { CategoryBar } from '@/ui/category-bar';
import { api } from '@/trpc/react';
import type { AvailableChartColorsKeys } from '@/utils/charts';
import { type AppRouter } from '@/server/api/root';

export default function IntakePage() {
  const [weekRef, setWeekRef] = useState('current');

  const __generateWeek = () => {
    switch (weekRef) {
      case 'past':
        return generatePastWeek();
      case 'current':
        return generateThisWeek();
      case 'next':
        return generateNextWeek();
      default:
        return [];
    }
  };

  const week = __generateWeek();

  return (
    <section className="flex flex-col gap-10 pt-10">
      <div className="flex items-center justify-end gap-4">
        <Tabs defaultValue="current" onValueChange={setWeekRef}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="past">Past week</TabsTrigger>
            <TabsTrigger value="current">This week</TabsTrigger>
            <TabsTrigger value="next">Next week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {week.map((item) => (
          <MealRecord key={format(item, 'dd-mm-yyyy')} date={item} />
        ))}
      </div>
    </section>
  );
}

function MealRecord(props: { date: Date }) {
  const { date } = props;

  const { data: meals = [], isLoading: isLoadingMeals } = api.meals.list.useQuery(undefined, { refetchOnMount: false });
  const { data: intakeRecords = [] } = api.intake.forDay.useQuery({ day: date });

  const recordedMeals = meals.map((meal) => {
    const record = intakeRecords.find((record) => record.meal_id === meal.id);
    return record ? meal : null;
  });

  const goalsAndSums = generateGoalsAndSums(meals, intakeRecords);

  return (
    <div className="bg-white p-4 rounded-md h-56 flex flex-col gap-4">
      <span className="text-xl font-medium">{format(date, 'dd MMM')}</span>
      {isLoadingMeals ? (
        <>
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
          <div className="flex-1" />
        </>
      ) : null}
      {meals.length ? (
        <div className="grid grid-cols-3 my-auto">
          <div className="flex flex-col items-center justify-center gap-2">
            <span>
              <span className="text-3xl font-bold">{goalsAndSums.carbsSum}</span> /{goalsAndSums.carbsTotals}
            </span>
            <span>Carbs</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <span>
              <span className="text-3xl font-bold">{goalsAndSums.proteinsSum}</span> /{goalsAndSums.proteinsTotals}
            </span>
            <span>Proteins</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <span>
              <span className="text-3xl font-bold">{goalsAndSums.fatsSum}</span> /{goalsAndSums.fatsTotals}
            </span>
            <span>Fats</span>
          </div>
        </div>
      ) : null}
      {meals.length ? <MealBars meals={recordedMeals} /> : null}
    </div>
  );
}

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
type Record = inferRouterOutputs<AppRouter>['intake']['forDay'][0];

function MealBars(props: { meals: (Meal | null)[] }) {
  const { meals } = props;
  const count = meals.length;

  const slots = Array.from({ length: count }, () => 100/count);
  const colors = meals.map((meal) => meal ? 'emerald' : 'neutral');

  return (
    <CategoryBar values={slots} colors={colors as AvailableChartColorsKeys[]} />
  );
}

function generateThisWeek() {
  const today = new Date();
  return generateWeek(today);
}

function generatePastWeek() {
  const today = new Date();
  const lastWeek = subWeeks(today, 1);
  return generateWeek(lastWeek);
}

function generateNextWeek() {
  const today = new Date();
  const lastWeek = addWeeks(today, 1);
  return generateWeek(lastWeek);
}

function generateWeek(date: Date) {
  const __startOfWeek = startOfWeek(date);
  const weekArr = new Array<Date>(7);

  for (let i = 0; i < weekArr.length; i++) {
    if (i === 0) {
      weekArr[i] = __startOfWeek;
    } else {
      weekArr[i] = addDays(__startOfWeek, i);
    }
  }

  return weekArr;
}

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
    carbsSum: Math.fround(carbsSum),
    proteinsTotals,
    proteinsSum,
    fatsTotals,
    fatsSum,
  };
}
