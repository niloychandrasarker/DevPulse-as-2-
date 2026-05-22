import app from "./app";

const main = () => {
  const port = 5000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
