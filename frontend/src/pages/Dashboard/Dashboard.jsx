import React, { useState, useEffect, useContext, useRef } from "react";
import UserContext from "../../context/UserContext";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Our Components and Utilities
import { UserAPI } from "../../services/api/UserAPI";

// Third Party Components and Utilities
import { Paper, Tab, TableContainer, Button } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
	UserTable,
	AdminTable,
	UserSettings,
	ModifyAdminTable
} from "../../components";

// There is no longer a useNavigate state prop called role.
// There is now, instead, a UserContext object being provided
//   to all of App. I have performed some trickery to make
//   this UserContext stateful!! You can import the user object
//   and its setting function using const {user, setUser} = useContext(UserContext)
// This is one big refactor forward toward Firebase
//   integration and being able to track User auth --Tony

const Dashboard = () => {
	const { user, setUser } = useContext(UserContext);

	// State for Tabs
	const [tabValue, setTabValue] = useState("1");

	// Analytics

	ChartJS.register(ArcElement, Tooltip, Legend);

	const donutData = {
		labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
		datasets: [
			{
				label: "# of Votes",
				data: [12, 19, 3, 5, 2, 3],
				backgroundColor: [
					"rgba(255, 99, 132, 0.2)",
					"rgba(54, 162, 235, 0.2)",
					"rgba(255, 206, 86, 0.2)",
					"rgba(75, 192, 192, 0.2)",
					"rgba(153, 102, 255, 0.2)",
					"rgba(255, 159, 64, 0.2)"
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
					"rgba(255, 159, 64, 1)"
				],
				borderWidth: 1
			}
		]
	};

	////////////////////////////////////////// USER VIEW ////////////////////////////////////

	// State for Users
	const [userData, setUserData] = useState(user.tasks);
	const [userInData, setUserInData] = useState(
		user.tasks.filter(entry => entry.task.kind === "IN_PROCESSING")
	);
	const [userOutData, setUserOutData] = useState(
		user.tasks.filter(entry => entry.task.kind === "OUT_PROCESSING")
	);

	if (user.role.kind === "USER") {
		return (
			<>
				<TabContext value={tabValue}>
					<TabList onChange={(e, nv) => setTabValue(nv)}>
						<Tab label="Inprocessing Tasks" value="1" />
						<Tab label="Outprocessing Tasks" value="2" />
						<Tab label="User Settings" value="3" />
					</TabList>

					<TabPanel value="1">
						<TableContainer component={Paper}>
							{userData.length > 0 && <UserTable alldata={userInData} />}
						</TableContainer>
					</TabPanel>

					<TabPanel value="2">
						<TableContainer component={Paper}>
							{userData.length > 0 && <UserTable alldata={userOutData} />}
						</TableContainer>
					</TabPanel>

					<TabPanel value="3">
						<UserSettings settings={user} />
					</TabPanel>
				</TabContext>
				<Doughnut data={donutData} />
			</>
		);
	}

	////////////////////////////////////////// ADMIN VIEW ////////////////////////////////////

	// State for Admin and Admin Pagination
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(7);
	const [revision, setRevision] = useState(0);

	const [data, setData] = useState(user.tasksAssigned);

	const [dataForAdminIn, setDataForAdminIn] = useState(
		user.tasksAssigned.filter(tasker => tasker.kind === "IN_PROCESSING")
	);
	const [totalAdminInPages, setTotalAdminInPages] = useState(0);
	const [adminInForLoop, setAdminInForLoop] = useState([]);

	const [dataForAdminOut, setDataForAdminOut] = useState(
		user.tasksAssigned.filter(tasker => tasker.kind === "OUT_PROCESSING")
	);
	const [totalAdminOutPages, setTotalAdminOutPages] = useState(0);
	const [adminOutForLoop, setAdminOutForLoop] = useState([]);

	const [adminTaskApprovers, setAdminTaskApprovers] = useState([]);

	// START OF FUNCTIONS FOR ADMIN VIEW PAGINATION LOGIC --Tony | Line 70 to 141

	// This useEffect is mostly for Admin View
	// I wouldn't worry about builing it out for Users
	// since the Users view has so few tasks compared
	// to the Admin view and pagination isn't needed.

	const retrieveTaskApproversThatShareAdminUnitID = () => {
		const taskApproversApi = new UserAPI();
		taskApproversApi
			.roleID(6)
			.assignedUnitID(user.assignedUnit.id)
			.limit(100)
			.get()
			.then(response => response.json())
			.then(taskapprovers => setAdminTaskApprovers(taskapprovers.data))
			.catch(err => console.log(err));
	};

	const calculateTotalPaginationPages = () => {
		setTotalAdminInPages(parseInt(dataForAdminIn.length / (end - start)) + 1);
		setTotalAdminOutPages(parseInt(dataForAdminOut.length / (end - start)) + 1);
	};

	useEffect(retrieveTaskApproversThatShareAdminUnitID, []);

	useEffect(calculateTotalPaginationPages, [
		user,
		dataForAdminIn,
		dataForAdminOut,
		start,
		end
	]);

	useEffect(() => {
		let idxs = [];
		for (let i = 0; i < totalAdminInPages; i++) idxs.push(i);
		setAdminInForLoop(idxs);
	}, [user, totalAdminInPages]);

	useEffect(() => {
		let idxs = [];
		for (let i = 0; i < totalAdminOutPages; i++) idxs.push(i);
		setAdminOutForLoop(idxs);
	}, [user, totalAdminOutPages]);

	useEffect(() => {
		setDataForAdminIn(
			user.tasksAssigned.filter(tasker => tasker.kind === "IN_PROCESSING")
		);
		setDataForAdminOut(
			user.tasksAssigned.filter(tasker => tasker.kind === "OUT_PROCESSING")
		);
		setData(user.tasksAssigned);
		setRevision(revision + 1);
	}, [user]);

	const changeInprocessPage = e => {
		console.log(e.target.value);
		setStart((parseInt(e.target.value) - 1) * (end - start));
		setEnd(parseInt(e.target.value) * (end - start));
		setRevision(revision + 1);
	};

	const changeOutprocessPage = e => {
		console.log(e.target.value);
		setStart((parseInt(e.target.value) - 1) * (end - start));
		setEnd(parseInt(e.target.value) * (end - start));
		setRevision(revision + 1);
	};

	// END OF FUNCTIONS FOR ADMIN VIEW PAGINATION LOGIC --Tony | Line 70 to 141
	if (user.role.kind.includes("ADMIN")) {
		return (
			<>
				<TabContext value={tabValue}>
					<TabList onChange={(e, nv) => setTabValue(nv)}>
						<Tab label="Inprocessing Tasks" value="1" />
						<Tab label="Outprocessing Tasks" value="2" />
						<Tab label="Modify Admins" value="3" />
					</TabList>

					<TabPanel value="1">
						<p>
							Displaying {dataForAdminIn.slice(start, end).length} of{" "}
							{dataForAdminIn.length} Inprocessing Tasks.
						</p>
						{adminInForLoop.map(idx => (
							<Button
								sx={{ minWidth: "10px" }}
								key={idx}
								onClick={changeInprocessPage}
								value={idx + 1}
							>
								{idx + 1}
							</Button>
						))}
						<TableContainer component={Paper}>
							{dataForAdminIn.length > 0 && (
								<AdminTable
									key={revision}
									data={dataForAdminIn}
									start={start}
									end={end}
									revision={revision}
									approverList={adminTaskApprovers}
									kind={"IN_PROCESSING"}
								/>
							)}
						</TableContainer>
					</TabPanel>

					<TabPanel value="2">
						<p>
							Displaying {dataForAdminOut.slice(start, end).length} of{" "}
							{dataForAdminOut.length} Outprocessing Tasks.
						</p>
						{adminOutForLoop.map(idx => (
							<Button
								sx={{ minWidth: "10px" }}
								key={idx}
								onClick={changeOutprocessPage}
								value={idx + 1}
							>
								{idx + 1}
							</Button>
						))}
						<TableContainer component={Paper}>
							{dataForAdminIn.length > 0 && (
								<AdminTable
									key={revision}
									data={dataForAdminOut}
									start={start}
									end={end}
									revision={revision}
									approverList={adminTaskApprovers}
									kind={"OUT_PROCESSING"}
								/>
							)}
						</TableContainer>
					</TabPanel>

					<TabPanel value="3">
						This is where I modify Admins.
						<p>
							This should show as a table view, where each row has a status and
							can be toggled as complete or not. Clicking on a row might show
							more info?
						</p>
						<TableContainer component={Paper}>
							<ModifyAdminTable
								data={
									tabValue === "3"
										? data?.filter(tasker => tasker.kind === "IN_PROCESSING")
										: data?.filter(tasker => tasker.kind === "OUT_PROCESSING")
								}
							/>
						</TableContainer>
					</TabPanel>
				</TabContext>
			</>
		);
	}

	// Generic View to Show if All Else Fails
	return (
		<>
			<h2>This is a Default Catchall View</h2>
			<p>Somehow authenticated but not as a viable role and made it here.</p>
		</>
	);
};

export default Dashboard;
