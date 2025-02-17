'use client';

import { useState } from 'react';
import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns';
import { type inferRouterOutputs } from '@trpc/server';

import { Skeleton, Tabs, TabsList, TabsTrigger, CategoryBar } from '@/ui';
import { api } from '@/trpc/react';
import type { AvailableChartColorsKeys } from '@/utils/charts';
import { generateGoalsAndSums } from '@/utils/exchanges';
import { type AppRouter } from '@/server/api/root';
import GoalRing from '@/components/goal-ring';

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
  const formattedDate = format(date, 'yyyy-MM-dd');
  const shortDate = format(date, 'dd MMM');
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: meals = [], isLoading: isLoadingMeals } = api.meals.list.useQuery(undefined, { refetchOnMount: false });
  const { data: intakeRecords = [] } = api.intake.forDay.useQuery({ day: date });

  const goalsAndSums = generateGoalsAndSums(intakeRecords);

  return (
    <div data-hightlight={formattedDate === today} className="bg-white p-4 rounded-md min-h-60 flex flex-col gap-10 border data-[hightlight=true]:border-purple-700">
      <span className="text-xl font-medium">{shortDate}</span>
      {isLoadingMeals ? (
        <div className="flex flex-col gap-4 my-auto">
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
          <Skeleton className="w-full h-5" />
        </div>
      ) : null}
      {meals.length ? (
        <div className="flex items-center justify-evenly my-auto">
          <GoalRing label="Carbs" ratio={goalsAndSums.carbsRatio} sum={goalsAndSums.carbsSum} total={goalsAndSums.carbsTotals} />
          <GoalRing label="Proteins" ratio={goalsAndSums.proteinsRatio} sum={goalsAndSums.proteinsSum} total={goalsAndSums.proteinsTotals} />
          <GoalRing label="Fats" ratio={goalsAndSums.fatsRatio} sum={goalsAndSums.fatsSum} total={goalsAndSums.fatsTotals} />
        </div>
      ) : null}
      {meals.length ? <MealBars meals={meals} records={intakeRecords} /> : null}
    </div>
  );
}

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
type Record = inferRouterOutputs<AppRouter>['intake']['forDay'][0];

function MealBars(props: { meals: Meal[]; records: Record[] }) {
  const { meals, records } = props;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {meals.map((meal) => {
          const mealRecords = records.filter((record) => record.meal_id === meal.id);
          const goalsAndSums = generateGoalsAndSums(mealRecords);

          return (
            <div key={meal.id}>
              <span className="text-xs text-center">{meal.name}</span>
              <CategoryBar
                values={[33, 33, 33]}
                colors={[
                  resolveColor(goalsAndSums.carbsRatio),
                  resolveColor(goalsAndSums.proteinsRatio),
                  resolveColor(goalsAndSums.fatsRatio)
                ] as AvailableChartColorsKeys[]}
              />
            </div>
          )
        })}
      </div>
    </div>
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

function resolveColor(ratio: number) {
  if (ratio > 120) return 'fuchsia';
  if (80 <= ratio && ratio <= 100) return 'emerald';
  if (30 <= ratio && ratio <= 79) return 'amber';
  if (1 <= ratio && ratio <= 29) return 'red';
  return 'neutral';
}
