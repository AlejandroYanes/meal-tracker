'use client';

import { useState } from 'react';
import { addDays, subDays } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, DatePicker } from '@/ui';
import { api } from '@/trpc/react';
import MealCard from './__components/meal-card';
import GoalRing from '@/components/goal-ring';
import { generateGoalsAndSums } from '@/utils/exchanges';

export default function IntakePage() {
  const [date, setDate] = useState(new Date());

  const { data: meals = [] } = api.meals.list.useQuery();
  const { data: records = [] } = api.intake.forDay.useQuery({ day: date });

  const goalsAndSums = generateGoalsAndSums(records);

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
            <GoalRing label="Carbs" ratio={goalsAndSums.carbsRatio} sum={goalsAndSums.carbsSum} total={goalsAndSums.carbsTotals} />
            <GoalRing label="Proteins" ratio={goalsAndSums.proteinsRatio} sum={goalsAndSums.proteinsSum} total={goalsAndSums.proteinsTotals} />
            <GoalRing label="Fats" ratio={goalsAndSums.fatsRatio} sum={goalsAndSums.fatsSum} total={goalsAndSums.fatsTotals} />
          </div>
        </CardContent>
      </Card>
      {meals.map(meal => (
        <MealCard key={meal.id} meal={meal} day={date} />
      ))}
    </section>
  );
}
