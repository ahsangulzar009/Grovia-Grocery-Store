import mongoose from 'mongoose'

const RETRY_MS = 5_000
const MAX_RETRY_MS = 30_000

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MongoDB: MONGO_URI is not defined")
    process.exit(1)
  };

  mongoose.connection.on("disconnected", () => console.warn("MongoDB: disconnected - requests"))
  mongoose.connection.on("reconnected", () => console.warn("MongoDB: reconnected"))
  mongoose.connection.on("error", (error) => console.warn("MongoDB: connection error", error))

  let delay = RETRY_MS;
  for (; ;) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8_000,
        heartbeatFrequencyMS: 10_000,
        maxPoolSize: 20,
        minPoolSize: 2,
        maxIdleTimeMS: 60_000,
        socketTimeoutMS: 45_000
      })

      console.log(`MongoDB Connected: ${conn.connection.host}`)
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`MongoDB Connection Error: ${message} - retrying in ${delay/1000}s`)
      await new Promise((resolve)=>setTimeout(resolve, delay))
      delay = Math.min(delay * 2, MAX_RETRY_MS)
    }
  }

}

export default connectDB