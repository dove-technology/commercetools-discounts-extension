import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { proxy } from "./lib/commerce-tools-dovetech-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = 8080;

app.post("/", (req: Request, res: Response) => {
  const cart = req.body.resource.obj;

  // not sure about async in Express v4 at the moment
  proxy(cart).then((extensionResponse) => {
    if (extensionResponse.success) {
      res.status(200).json({
        actions: extensionResponse.actions,
      });
      return;
    }
    res
      .status(extensionResponse.errorResponse.statusCode)
      .json(extensionResponse.errorResponse);
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
