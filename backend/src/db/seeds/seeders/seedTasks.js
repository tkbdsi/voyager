import { createRequire } from "module";
import { genData } from "../utils";

const require = createRequire(import.meta.url);
const tasks = require("../data/tasks.json");

const seedTasks = async (prisma, dbg = false) => {
	await genData(
		prisma,
		"Task",
		tasks,
		[
			{
				display: "In Processing",
				fieldName: "kind",
				fieldVal: "IN_PROCESSING"
			},
			{
				display: "Out Processing",
				fieldName: "kind",
				fieldVal: "OUT_PROCESSING"
			}
		],
		dbg
	);
};

export default seedTasks;
