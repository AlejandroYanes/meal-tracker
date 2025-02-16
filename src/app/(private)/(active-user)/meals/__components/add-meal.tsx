'use client';
import { useState } from 'react';

import { Button } from '@/ui';
import MealModal, { type MealInput } from './meal-modal';

export default function AddMeal() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Add new meals</Button>
      {showModal ? <MealModal defaultValues={defaultValues} onClose={() => setShowModal(false)} /> : null}
    </>
  );
}

const defaultValues: MealInput = {
  name: '',
  carbs_goal: 0,
  proteins_goal: 0,
  fats_goal: 0,
};
