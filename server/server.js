import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/db.js';

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`✓ IBP convention server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
