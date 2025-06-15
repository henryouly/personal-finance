import { createTRPCRouter } from "../init";
import { baseProcedure } from "../init";
import { getAllCategories } from "@/db/queries";

export const categoriesRouter = createTRPCRouter({
  list: baseProcedure.query(getAllCategories),
});