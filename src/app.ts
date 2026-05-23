import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import globalErrorHandler from "./globalerrorhandler/globalErrorHandler";
import { authRoute } from "./module/auth/auth.route";
import { issueRoute } from "./module/Issue/issue.router";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("TypeScript Backend Running");
});

app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);

app.use(globalErrorHandler);

export default app;
