import type { inferRouterOutputs } from '@trpc/server';
import { NotebookPenIcon } from 'lucide-react';

import type { AppRouter } from '@/server/api/root';
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

type Meal = inferRouterOutputs<AppRouter>['meals']['list'][0];

interface Props {
  meal: Meal;
}

export default function MealCard(props: Props) {
  const { meal } = props;
  return (
    <Card>
      <CardHeader className="space-y-0 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{meal.name}</CardTitle>
        <Button variant="link">
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
            <TableRow>
              <TableCell>test</TableCell>
              <TableCell className="text-center">test</TableCell>
              <TableCell className="text-center">test</TableCell>
              <TableCell className="text-center">test</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
