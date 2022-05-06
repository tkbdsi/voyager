import React, { useState, useEffect, useContext } from "react";
import UserContext from "../../context/UserContext";

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

	const data = user.tasksAssigned;

	// State for Tabs
	const [tabValue, setTabValue] = useState("1");

	// State for Users
	const [userData, setUserData] = useState(user.tasks);
	const [userInData, setUserInData] = useState(
		user.tasks.filter(entry => entry.task.kind === "IN_PROCESSING")
	);
	const [userOutData, setUserOutData] = useState(
		user.tasks.filter(entry => entry.task.kind === "OUT_PROCESSING")
	);

	// State for Admin and Admin Pagination
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(7);
	const [revision, setRevision] = useState(0);

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

	// START OF FUNCTIONS FOR USER VIEW

	// none at this time

	// START OF FUNCTIONS FOR ADMIN VIEW PAGINATION LOGIC --Tony | Line 67 to 118

	// This useEffect is mostly for Admin View
	// I wouldn't worry about builing it out for Users
	// since the Users view has so few tasks compared
	// to the Admin view and pagination isn't needed.

	useEffect(() => {
		console.log(user?.assignedUnit.name);
		fetch(
			`http://localhost:8081/api/v1/users?roleID=6&assignedUnitID=${user.assignedUnit.id}&limit=50`
		)
			.then(response => response.json())
			.then(taskapprovers => setAdminTaskApprovers(taskapprovers.data));
	}, []);

	useEffect(() => {
		setTotalAdminInPages(parseInt(dataForAdminIn.length / (end - start)) + 1);
		setTotalAdminOutPages(parseInt(dataForAdminOut.length / (end - start)) + 1);
	}, [dataForAdminIn, setTotalAdminOutPages, start, end]);

	useEffect(() => {
		let idxs = [];
		for (let i = 0; i < totalAdminInPages; i++) idxs.push(i);
		setAdminInForLoop(idxs);
	}, [totalAdminInPages]);

	useEffect(() => {
		let idxs = [];
		for (let i = 0; i < totalAdminOutPages; i++) idxs.push(i);
		setAdminOutForLoop(idxs);
	}, [totalAdminOutPages]);

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

	// END OF FUNCTIONS FOR ADMIN VIEW PAGINATION LOGIC --Tony | Line 50 to 98

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
			</>
		);
	}

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
