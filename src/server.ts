import app from "./app";
import config from "./config";
import { initDB } from "./db";

const main = () => {
  initDB();

  if (!process.env.VERCEL) {
    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  }
};

main();

export default app;
