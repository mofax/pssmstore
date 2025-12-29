import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./generated/client";
import path from "path";

export const dataPath = path.join(process.cwd(), "/pssm-data/data.db");
export const dataPathURI = `file:${dataPath}`;
const adapter = new PrismaLibSql({
	url: dataPathURI,
});

const models = [
	"identities",
	"folders",
	"pages",
] as const;

export type ModelName = (typeof models)[number];

export function modelNameGuard(model: string): typeof models[number] {
	if (!models.includes(model as (typeof models)[number])) {
		throw new Error(`Invalid model name: ${model}`);
	}
	return model as typeof models[number];
}

export const prisma = new PrismaClient({ adapter });
