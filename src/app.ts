import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import globalErrorHandler from "./globalerrorhandler/globalErrorHandler";

const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Backend Running");
});





app.use(globalErrorHandler)

export default app;
