require('dotenv').config();
const { createApp } = require('./app');
const { connectDB } = require('./config/db');

async function main() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  await connectDB();
  const port = Number(process.env.PORT) || 4000;
  createApp().listen(port, () => console.log(`[api] Panda.al API në http://localhost:${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
