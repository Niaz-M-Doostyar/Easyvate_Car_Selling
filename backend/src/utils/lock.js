const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../models');

/**
 * Run a callback while holding a MySQL named lock.
 *
 * The lock queries and callback share one Sequelize transaction, which pins
 * them to the same pooled connection. MySQL named locks are connection-scoped,
 * so acquiring and releasing through different pool connections is unsafe.
 */
async function withLock(key, timeoutSeconds, fn) {
  const lockKey = String(key).slice(0, 64);

  return sequelize.transaction(async transaction => {
    let acquired = false;

    try {
      const results = await sequelize.query(
        'SELECT GET_LOCK(:key, :timeout) AS acquired',
        {
          replacements: { key: lockKey, timeout: timeoutSeconds },
          type: QueryTypes.SELECT,
          transaction
        }
      );

      acquired = Number(results[0]?.acquired) === 1;
      if (!acquired) {
        const error = new Error('Could not acquire attendance lock');
        error.code = 'LOCK_TIMEOUT';
        throw error;
      }

      return await fn(transaction);
    } finally {
      if (acquired) {
        await sequelize.query(
          'SELECT RELEASE_LOCK(:key) AS released',
          {
            replacements: { key: lockKey },
            type: QueryTypes.SELECT,
            transaction
          }
        ).catch(error => {
          console.error('Failed to release MySQL lock:', error.message);
        });
      }
    }
  });
}

module.exports = { withLock };
