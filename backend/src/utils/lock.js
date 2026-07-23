// utils/lock.js
const { sequelize } = require('../models');

/**
 * Acquire a MySQL named lock on a dedicated connection.
 * Returns a release function that must be called when done.
 */
async function withLock(key, timeoutSeconds, fn) {
  // Get a raw connection from the pool
  const connection = await sequelize.connectionManager.getConnection();

  try {
    // Acquire lock on this connection
    const [results] = await connection.query(
      `SELECT GET_LOCK(:key, :timeout) AS acquired`,
      {
        replacements: { key, timeout: timeoutSeconds },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (results.acquired !== 1) {
      throw new Error('Could not acquire lock');
    }

    // Execute the critical section (pass connection if needed)
    return await fn();
  } finally {
    // Release lock on the SAME connection
    await connection.query(`SELECT RELEASE_LOCK(:key)`, {
      replacements: { key },
    }).catch(console.error);
    // Return the connection to the pool
    sequelize.connectionManager.releaseConnection(connection);
  }
}

module.exports = { withLock };