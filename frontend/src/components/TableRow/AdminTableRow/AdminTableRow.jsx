// React Base Functionality
import React, { useState, useEffect, useContext } from "react";

// Our Components and Services
import { UserContext } from "#context";
import { TaskAPI } from "#services/api/TaskAPI";
import { UserAPI } from "#services/api/UserAPI";

// MUI Components
import {
	TableRow,
	TableCell,
	Switch,
	Button,
	TextField,
	IconButton,
	Dialog,
	DialogContent,
	DialogActions,
	DialogTitle,
	DialogContentText,
	Select,
	MenuItem
} from "@mui/material";

import { Delete, Star } from "@mui/icons-material";
import { DeleteDialog, InfoDialog } from "#components";

// Start of the AdminTableRow React Hook

const AdminTableRow = ({ entry, setMessage, approverList }) => {
	const { user, setUser } = useContext(UserContext);

	//START of AdminTableRow State
	const [isActive, setIsActive] = useState(entry.isActive);
	const [taskTitle, setTaskTitle] = useState(entry.title);
	const [oldTitle, setOldTitle] = useState(entry.title);
	const [taskDesc, setTaskDesc] = useState(entry.description);
	const [oldDesc, setOldDesc] = useState(entry.description);

	const [pocName, setPocName] = useState(
		entry.approver.firstName + " " + entry.approver.lastName
	);
	const [taskKind, setTaskKind] = useState(entry.kind);
	const [pocID, setPocID] = useState(entry.approver.id);
	const [pocPhone, setPocPhone] = useState(`${entry.approver.dsn}`);
	const [pocEmail, setPocEmail] = useState(`${entry.approver.email}`);
	// END of AdminTableRow State

	// START of Dialog Boxes State -- see Jelani
	const [open, setOpen] = useState(false);
	const [delete_open, delete_setOpen] = useState(false);
	const [info_open, info_setOpen] = useState(false);
	// END of Dialog Boxes State

	const handleChange = event => {
		console.log(`Switch has been changed id ${entry.id}`);
		setIsActive(event.target.vlue);
	};

	const delete_handleClickOpen = () => {
		delete_setOpen(true);
	};

	const handleClose = () => {
		delete_setOpen(false);
		info_setOpen(false);
		setOpen(false);
	};

	const info_handleClickOpen = () => {
		info_setOpen(true);
	};
	var updatedAt = new Date(entry.updatedAt);
	//const DeleteDialogProps = { delete_open, handleClose, entry };
	//const InfoDialogProps = { info_open, handleClose, entry };

	const handleDelete = value => {
		// const deleteTask = new TaskAPI();
		// deleteTask
		// 	.delete(parseInt(value))
		// 	.then(response => response.text())
		// 	.then(setMessage(`Deleted Task Number ID: ${value}!`))
		// 	.then(() => {
		// 		const refreshUser = new UserAPI();
		// 		refreshUser
		// 			.email(user.email)
		// 			.get()
		// 			.then(response => response.json())
		// 			.then(d => setUser(d.data[0]));
		//
		// 	})
		// 	.catch(err => console.log(err));
		const requestOptions = {
			method: "DELETE",
			redirect: "follow"
		};

		fetch(
			`http://localhost:8081/api/v1/tasks/${parseInt(value)}`,
			requestOptions
		)
			.then(response => response.text())
			.then(setMessage(`Deleted Task Number ID: ${value}!`))
			.then(() => {
				const refreshUser = new UserAPI();
				refreshUser
					.email(user.email)
					.get()
					.then(response => response.json())
					.then(d => setUser(d.data[0]));
			})
			.catch(error => console.log("error", error));
	};

	const handlePut = stringifiedJSON => {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var requestOptions = {
			method: "PUT",
			headers: myHeaders,
			body: stringifiedJSON,
			redirect: "follow"
		};
		fetch(`http://localhost:8081/api/v1/tasks/${entry.id}`, requestOptions)
			.then(response => response.json())
			.then(result => console.log("PUT", result))
			.then(() => {
				const refreshUser = new UserAPI();
				refreshUser
					.email(user.email)
					.get()
					.then(response => response.json())
					.then(d => setUser(d.data[0]));
			})
			.catch(error => console.log("error", error));
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			if (taskTitle !== oldTitle)
				handlePut(JSON.stringify({ title: taskTitle }));
		}, 1000);
		return () => clearTimeout(timer);
	}, [taskTitle]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (taskDesc !== oldDesc)
				handlePut(JSON.stringify({ description: taskDesc }));
		}, 1000);
		return () => clearTimeout(timer);
	}, [taskDesc]);

	const updatePocID = e => {
		setPocID(parseInt(e.target.value));
		let raw = JSON.stringify({
			approverID: e.target.value
		});
		handlePut(raw);
	};

	const updateIsActive = e => {
		let raw = JSON.stringify({
			isActive: !isActive
		});
		setIsActive(!isActive);
		handlePut(raw);
	};

	return (
		<>
			{/* <DeleteDialog dialogDetails={dialogDetails} /> */}
			{/* modal for delete(trash can icon) */}
			<Dialog open={delete_open} onClose={handleClose}>
				<DialogTitle id="delete-modal">
					{`Are you sure you want to delete ${entry.title}`}
				</DialogTitle>
				<DialogContentText id="delete-dialog-description">
					You will not be able to reset this deletion
				</DialogContentText>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleClose} autoFocus>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={info_open} onClose={handleClose}>
				<DialogTitle id="more-info-modal">{`${entry.title}`}</DialogTitle>
				<DialogContentText id="info-dialog-description-task-type">
					{`${entry.task_type}`}
				</DialogContentText>
				<DialogContentText id="info-dialog-Space">
					{
						"------------------------------------------------------------------------------------------"
					}
				</DialogContentText>
				<DialogContentText id="info-dialog-POC-Owner">
					{`POC: ${entry.approver}------Unit Owner: ${entry.owner}
					`}
					{""}
				</DialogContentText>
				<DialogContentText id="info-dialog-Space">
					{
						"------------------------------------------------------------------------------------------"
					}
				</DialogContentText>
				<DialogContentText id="info-dialog-description-">
					{`${entry.description}`}
				</DialogContentText>
				<DialogContentText id="info-dialog-Space">
					{
						"------------------------------------------------------------------------------------------"
					}
				</DialogContentText>
				<DialogContentText id="info-dialog-date">
					{`${
						updatedAt.getUTCMonth() + 1
					} - ${updatedAt.getUTCDate()} - ${updatedAt.getUTCFullYear()}`}
				</DialogContentText>

				<DialogActions>
					<Button onClick={handleClose}>Exit</Button>
				</DialogActions>
			</Dialog>
			{/* <Dialog open={open} onClose={handleClose}>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						More Info Coming
					</DialogContentText>
				</DialogContent>
			</Dialog> */}
			<TableRow>
				<TableCell>
					<Switch
						checked={isActive}
						name="isActive"
						value={isActive}
						onChange={updateIsActive}
					/>
				</TableCell>
				<TableCell>
					<TextField
						size="small"
						value={taskTitle}
						sx={{ width: "30ch" }}
						onChange={e => setTaskTitle(e.target.value)}
					/>
				</TableCell>
				<TableCell>
					<TextField
						size="small"
						value={taskDesc}
						sx={{ width: "45ch" }}
						onChange={e => setTaskDesc(e.target.value)}
					/>
				</TableCell>
				<TableCell>
					<Select
						value={pocID}
						onChange={updatePocID}
						sx={{ width: "20ch" }}
						name="pocID"
					>
						{approverList.length > 0 &&
							approverList.map((approver, idx) => (
								<MenuItem key={idx} value={approver.id}>
									{approver.firstName} {approver.lastName}
								</MenuItem>
							))}
					</Select>
				</TableCell>
				<TableCell>
					<TextField size="small" value={pocPhone} sx={{ width: "25ch" }} />
				</TableCell>
				<TableCell>
					<TextField size="small" value={pocEmail} sx={{ width: "25ch" }} />
				</TableCell>
				<TableCell>
					{`${
						updatedAt.getUTCMonth() + 1
					} - ${updatedAt.getUTCDate()} - ${updatedAt.getUTCFullYear()}`}
				</TableCell>
				<TableCell>
					<IconButton
						aria-label="info"
						onClick={() => {
							info_handleClickOpen();
							console.log(`Info Request id ${entry.id}`);
						}}
					>
						<Star />
					</IconButton>
				</TableCell>
				<TableCell>
					<IconButton
						aria-label="delete"
						onClick={e => {
							//delete_handleClickOpen();
							handleDelete(entry.id);
						}}
						data-testid={`delete-button-${entry.id}`}
					>
						<Delete />
					</IconButton>
				</TableCell>
			</TableRow>
		</>
	);
};
export default AdminTableRow;
