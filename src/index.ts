import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { proxy } from "./lib/commerce-tools-dovetech-proxy";

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.post("/", (req: Request, res: Response) => {
  // var cart = req.body.resource.obj;

  // not sure about async in Express v4 at the moment
  var actions = proxy(req.body).then((actions) => {
    return actions;
  });

  res.status(200).json({
    actions,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
