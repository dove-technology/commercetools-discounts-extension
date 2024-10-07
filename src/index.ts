import express, { Request, Response } from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
