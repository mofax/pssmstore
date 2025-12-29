import postgres from "postgres";
import { envar } from "../utilities/envvar";

export const pg = postgres(envar("DATABASE_URL"));
