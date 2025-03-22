const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const purchaseRoutes = require("./routes/purchaseRoutes");
const adminRoutes = require("./routes/adminRoutes");
const successRoute = require("./routes/success");
const rconRoute = require("./routes/rconRoute");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 🛒 User Purchases & Payments
app.use("/api/purchase", purchaseRoutes);
app.use("/api", successRoute);
app.use("/api", rconRoute);

// 🔐 Admin Panel
app.use("/api/admin", adminRoutes);

// 🔄 Cashfree Webhook
app.post("/cashfree-webhook", purchaseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
