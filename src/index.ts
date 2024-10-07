import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
