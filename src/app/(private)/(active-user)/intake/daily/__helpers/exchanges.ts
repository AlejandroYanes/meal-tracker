import type { inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@/server/api/root';

type Record = inferRouterOutputs<AppRouter>['intake']['forDay'][0];
type FoodIntake = Record['foods'][0];

export function generateGoalsAndSums(records: Record[]) {
  let carbsTotals = 0;
  let carbsSum = 0;
  let proteinsTotals = 0;
  let proteinsSum = 0;
  let fatsTotals = 0;
  let fatsSum = 0;

  records.forEach((meal) => {
    carbsTotals = carbsTotals + meal.carbs_goal;
    proteinsTotals = proteinsTotals + meal.proteins_goal;
    fatsTotals = fatsTotals + meal.fats_goal;

    const mealExchanges = meal.foods.reduce((acc, food) => {
      const exchanges = calculateExchanges(food);

      return {
        carbsSum: acc.carbsSum + exchanges.carbs,
        proteinsSum: acc.proteinsSum + exchanges.proteins,
        fatsSum: acc.fatsSum + exchanges.fats,
      };
    }, { carbsSum: 0, proteinsSum: 0, fatsSum: 0 });

    carbsSum = carbsSum + mealExchanges.carbsSum;
    proteinsSum = proteinsSum + mealExchanges.proteinsSum;
    fatsSum = fatsSum + mealExchanges.fatsSum;
  });

  return {
    carbsTotals: carbsTotals.toFixed(1),
    carbsSum: Math.fround(carbsSum).toFixed(1),
    carbsRatio: getNumberOrZero(Math.round(((carbsSum / carbsTotals) * 100))),
    proteinsTotals: proteinsTotals.toFixed(1),
    proteinsSum: Math.fround(proteinsSum).toFixed(1),
    proteinsRatio: getNumberOrZero(Math.round(((proteinsSum / proteinsTotals) * 100))),
    fatsTotals: fatsTotals.toFixed(1),
    fatsSum: Math.fround(fatsSum).toFixed(1),
    fatsRatio: getNumberOrZero(Math.round(((fatsSum / fatsTotals) * 100))),
  };
}

function getNumberOrZero(num: number) {
  if (Number.isNaN(num)) return 0;

  return num;
}

export function calculateExchanges(food: FoodIntake) {
  const { base_amount, amount_consumed, fats, proteins, carbs } = food;

  const consumptionRatio = amount_consumed / base_amount;

  return {
    carbs: Math.fround(carbs * consumptionRatio),
    proteins: Math.fround(proteins * consumptionRatio),
    fats: Math.fround(fats * consumptionRatio),
  };
}

export function normaliseExchanges(food: FoodIntake) {
  const exchanges = calculateExchanges(food);
  return  {
    carbs: exchanges.carbs.toFixed(1),
    proteins: exchanges.proteins.toFixed(1),
    fats: exchanges.fats.toFixed(1),
  }
}

