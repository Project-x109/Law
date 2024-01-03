const app = require("./app");
const connectDatabase = require("./config/db.js");
const port = process.env.PORT || 4000;
app.listen(port, () => {
  connectDatabase();
  console.log(`Server is running on port ${port}`);
});