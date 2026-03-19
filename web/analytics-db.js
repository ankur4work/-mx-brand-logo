import sqlite3 from 'sqlite3';

// This function creates a connection to the analytics database and initializes it
const createDbConnection = (appName) => {
    const db = new sqlite3.Database(`./${appName}_analytics.db`);

    // Create a generic table for logging events
    db.run(`
        CREATE TABLE IF NOT EXISTS ${appName}_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            merchant_id TEXT NOT NULL,
            event_data TEXT,  -- JSON string for storing event-specific details
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
};

export default createDbConnection;
