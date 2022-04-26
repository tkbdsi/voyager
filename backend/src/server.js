import express from "express";
// const db = require("./db");

const app = express();

app.use(express.json());

app.use( (req, res, next) => {
	res.header({
		'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type'
	})
	next();
})

app.get("/status", (req, res) => {
	res.send("good");
});

export default app;
