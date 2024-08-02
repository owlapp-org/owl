import logging
import queue
import threading
from contextlib import contextmanager
from typing import Any, Generator

import duckdb

logger = logging.getLogger(__name__)


class DuckDBConnectionPool:
    def __init__(self, database):
        self.pool = queue.Queue(database.pool_size)
        for _ in range(database.pool_size):
            conn = duckdb.connect(database.abs_path())
            self.pool.put(conn)
        self.lock = threading.Lock()

    def reset_pool_size(self, pool_size: int) -> "DuckDBConnectionPool":
        if pool_size <= 0:
            logger.warning(f"Can not set pool size to {pool_size}.Skipping the action.")
            return self
        elif pool_size == self.pool.qsize():
            logger.warning(
                f"Nothing to do {pool_size} is same with current pool size. Skipping the action."
            )
            return self

        with self.lock:
            current_size = self.pool.qsize()
            if pool_size < current_size:
                for _ in range(current_size - pool_size):
                    conn: duckdb.DuckDBPyConnection = self.pool.get()
                    conn.close()

            elif pool_size > current_size:
                for _ in range(pool_size - current_size):
                    conn = duckdb.connect(self.database.abs_path())
                    self.pool.put(conn)

        return self

    def get_connection(self) -> duckdb.DuckDBPyConnection:
        with self.lock:
            conn = self.pool.get()
            return conn

    def return_connection(self, conn):
        with self.lock:
            self.pool.put(conn)

    def close_all_connections(self):
        with self.lock:
            while not self.pool.empty():
                conn: duckdb.DuckDBPyConnection = self.pool.get()
                conn.close()

    @contextmanager
    def acquire_connection(self) -> Generator[duckdb.DuckDBPyConnection, Any, Any]:
        conn = self.get_connection()
        try:
            yield conn
        finally:
            self.return_connection(conn)
