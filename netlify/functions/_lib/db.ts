import mongoose from 'mongoose';

declare global {
    // eslint-disable-next-line no-var
    var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export function connectToDatabase(): Promise<typeof mongoose> {
    const uri = process.env.CONNECTION_URL;
    if (!uri) {
        throw new Error(
            'CONNECTION_URL is not set. Add it in Netlify: Site settings -> Environment variables.'
        );
    }

    // Reuse only if genuinely connected/connecting (readyState 1 or 2).
    if (
        global._mongooseConn &&
        [1, 2].includes(mongoose.connection.readyState)
    ) {
        return global._mongooseConn;
    }

    global._mongooseConn = mongoose
        .connect(uri, {
            dbName: process.env.DB_NAME || 'Web-Quiz-Project',
        })
        .catch((err) => {
            // Clear the cache on failure so the next invocation retries
            // instead of getting stuck on a rejected promise forever.
            global._mongooseConn = undefined;
            throw err;
        });

    return global._mongooseConn;
}