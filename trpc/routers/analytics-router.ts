import { createTRPCRouter } from "../init";
import { baseProcedure } from "../init";
import { z } from 'zod';
import { db } from '@/db/db';
import { transactions, categories } from '@/db/schema';
import { eq, and, gte, lte, sum } from 'drizzle-orm';
import { getCategorySpending, getIncomeVsExpense, getMonthlySpending } from '@/db/queries';

export const analyticsRouter = createTRPCRouter({
  categorySpending: baseProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      const defaultStartDate = new Date(now.getFullYear() - 5, now.getMonth(), 1);

      try {
        const result = await getCategorySpending(
          input.startDate ? new Date(input.startDate) : defaultStartDate,
          input.endDate ? new Date(input.endDate) : now
        );

        // Calculate total for percentage calculation
        const total = result.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);

        // Transform the data to match CategorySpending type
        const transformedData = result.map((item: any) => ({
          category: item.category,
          amount: parseFloat(item.total),
          percentage: total > 0 ? parseFloat(item.total) / total : 0,
          color: '#4CAF50', // Default color, can be overridden by the component
        }));

        return transformedData;
      } catch (error) {
        console.error('Error fetching category spending:', error);
        throw new Error('Failed to fetch category spending');
      }
    }),

  incomeVsExpense: baseProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Last 6 months by default

      try {
        const result = await getIncomeVsExpense(
          input.startDate ? new Date(input.startDate) : defaultStartDate,
          input.endDate ? new Date(input.endDate) : now
        );

        // Transform the data into the format expected by the chart
        const monthlyData: Record<string, { month: string; income: number; expense: number }> = {};

        result.forEach(item => {
          if (!monthlyData[item.month]) {
            monthlyData[item.month] = { month: item.month, income: 0, expense: 0 };
          }
          if (item.type === 'income') {
            monthlyData[item.month].income = item.total;
          } else if (item.type === 'expense') {
            monthlyData[item.month].expense = Math.abs(item.total);
          }
        });

        return Object.values(monthlyData);
      } catch (error) {
        console.error('Error fetching income vs expense data:', error);
        throw new Error('Failed to fetch income vs expense data');
      }
    }),

  monthlySpending: baseProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      const defaultStartDate = new Date(now.getFullYear() - 5, now.getMonth(), 1); // Last 5 years by default

      try {
        const result = await getMonthlySpending(
          input.startDate ? new Date(input.startDate) : defaultStartDate,
          input.endDate ? new Date(input.endDate) : now
        );

        const transformedData = result.map((item: any) => ({
          month: item.month,
          amount: Math.abs(parseFloat(item.total)), // Convert to positive number for display
        }));

        return transformedData;
      } catch (error) {
        console.error('Error fetching monthly spending:', error);
        throw new Error('Failed to fetch monthly spending data');
      }
    }),
});
