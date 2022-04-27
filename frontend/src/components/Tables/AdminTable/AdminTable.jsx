import {
	Table as MuiTable,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Switch,
	Button
} from "@mui/material";

//import { DeleteIcon } from "@mui/icons-material";
import AdminTableRow from "../../TableRow/AdminTableRow/AdminTableRow";
const AdminTable = ({ data }) => {
	return (
		<>
			<MuiTable size={"small"}>
				<TableHead>
					<TableRow>
						<TableCell>Active Task</TableCell>
						<TableCell>Task Name</TableCell>
						<TableCell>Short Description</TableCell>
						<TableCell>POC Name</TableCell>
						<TableCell>POC Phone</TableCell>
						<TableCell>POC Email</TableCell>
						<TableCell>Last Updated</TableCell>
						<TableCell>Owner</TableCell>
						<TableCell>More Info</TableCell>
						<TableCell>Delete Task</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map(entry => (
						<AdminTableRow hover={true} key={entry.id} entry={entry} />
					))}
				</TableBody>
			</MuiTable>
		</>
	);
};
export default AdminTable;
