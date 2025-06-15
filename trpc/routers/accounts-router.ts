import { createTRPCRouter } from "../init";
import { baseProcedure } from "../init";
import { z } from 'zod';
import { getAllAccounts, getAccountById } from "@/db/queries";

export const accountsRouter = createTRPCRouter({
  list: baseProcedure.query(getAllAccounts),
  getById: baseProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .query(({ input }) => getAccountById(input.id)),
});