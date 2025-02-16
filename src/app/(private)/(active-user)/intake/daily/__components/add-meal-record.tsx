import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { inferRouterOutputs } from '@trpc/server';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputWithLabel,
  Label,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui';
import { api } from '@/trpc/react';
import type { AppRouter } from '@/server/api/root';

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];
type Food = inferRouterOutputs<AppRouter>['food']['list'][0];

interface Props {
  meal: Meal;
  day: Date;
  onClose: () => void;
}

const foodIntakeSchema = z.object({
  food_id: z.number().min(0, 'Please select a food item'),
  amount: z.number().min(0, 'Please enter an amount'),
});
type FoodIntake = z.infer<typeof foodIntakeSchema>;

export default function AddMealRecord(props: Props) {
  const { meal, day, onClose } = props;

  const form = useForm<FoodIntake>({
    defaultValues: {
      food_id: -1,
      amount: 0,
    },
    resolver: zodResolver(foodIntakeSchema),
  });
  const selectedFoodId = form.watch('food_id');

  const { data: foods = [], isLoading } = api.food.list.useQuery();
  const selectedFood = foods.find(food => selectedFoodId === food.id);

  const utils = api.useUtils();
  const { mutate: recordIntake, isPending, error } = api.intake.add.useMutation({
    onSuccess: () => {
      void utils.intake.forDay.invalidate({ day });
      onClose();
    },
  });
  const errorMessage = error?.message;

  const handleSubmit = form.handleSubmit((values) => {
    recordIntake({ ...values, meal_id: meal.id, for_date: day });
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[500px]">
        <DialogHeader>
          <DialogTitle>
            What did you eat for {meal.name}?
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-6" onSubmit={handleSubmit}>
          <Controller
            name="food_id"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                <Label>Food<sup className="ml-2">*</sup></Label>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {foods.map((food) => (
                      <SelectItem key={food.id} value={food.id.toString()}>{food.name}</SelectItem>
                    ))}
                    {isLoading ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        <Loader size="sm" className="mr-2" />
                        <span>No options available</span>
                      </div>
                    ) : null}
                    {!isLoading && foods.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No options available
                      </div>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
          <Controller
            name="amount"
            control={form.control}
            render={({ field }) => (
              <InputWithLabel
                required
                type="number"
                label="Amount"
                {...field}
                value={field.value ?? 0}
                error={form.formState.errors.amount?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
                hint={craftFoodDetails(selectedFood)}
              />
            )}
          />
          {errorMessage ? (
            <span className="text-red-500 text-sm font-medium">{errorMessage}</span>
          ) : null}
          <DialogFooter className="pt-6">
            <Button className="px-8" disabled={isPending}>
              {isPending ? <Loader size="icon" color="white" className="mr-2" /> : null}
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function craftFoodDetails(food: Food | undefined) {
  if (!food) return undefined;

  const exchanges = `carbs: ${food.carbs} | proteins: ${food.proteins} | fats: ${food.fats}`;

  if (food.unit === 'piece') {
    return `${food.amount} ${food.unit} equals ${exchanges}`;
  }

  return `${food.amount}${food.unit} equals ${exchanges}`;
}
