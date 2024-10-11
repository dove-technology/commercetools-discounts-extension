import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { proxy } from "./lib/commerce-tools-dovetech-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.post("/", (req: Request, res: Response) => {
  var cart = req.body.resource.obj;

  // not sure about async in Express v4 at the moment
  proxy(cart).then((response) => {
    if (Array.isArray(response)) {
      res.status(200).json({
        actions: response,
      });
      return;
    }

    res.status(400).json(response);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
