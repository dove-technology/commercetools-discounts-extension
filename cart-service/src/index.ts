import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.disable("x-powered-by");

app.use(bodyParser.json());
const port = 8080;

app.post("/cart-service", (req: Request, res: Response) => {
  const cart = req.body.resource.obj;
  console.log("Cart received", cart.id);

  res.status(200).json({
    actions: [],
  });
  return;
});

app.use("*", (_: Request, res: Response) => {
  res.status(404).json({
    message: "Not Found",
  });

  return;
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
