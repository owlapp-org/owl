import logging
import threading

from app.lib.database.connection import DuckDBConnectionPool

logger = logging.getLogger(__name__)


class ConnectionPoolRegistry:
    def __init__(self):
        self.pools: dict[id, DuckDBConnectionPool] = {}
        self.lock = threading.Lock()

    def add(self, database):
        with self.lock:
            if database.id not in self.pools:
                self.pools[database.id] = DuckDBConnectionPool(database)
                logger.info(f"Connection pool created for database: {database}")

    def remove(self, id: int):
        with self.lock:
            if pool := self.pools.get(id):
                pool.close_all_connections()
                self.pools.pop(id)

    def get(self, id: int, database=None) -> DuckDBConnectionPool | None:
        with self.lock:
            if pool := self.pools.get(id):
                return pool
        if pool is None and database is not None:
            self.add(database=database)
            return self.pools.get(database.id)

    def close_all(self):
        with self.lock:
            for pool in self.pools.values():
                pool.close_all_connections()

    def remove_all(self):
        with self.lock:
            for id, pool in self.pools.items():
                pool.close_all_connections()
                self.pools.pop(id)


registry = ConnectionPoolRegistry()
