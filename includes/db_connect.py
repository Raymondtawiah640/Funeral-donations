"""
Database connection module for Legacy Donation backend
Provides MySQL database connection functionality
"""

import mysql.connector
from mysql.connector import Error
import json
from typing import Optional, Dict, Any

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "dbuser",
    "password": "kilnpassword1",
    "database": "Donations",
    "charset": "utf8mb4"
}

class DatabaseConnection:
    """
    Database connection class that handles MySQL connections
    Similar to PDO functionality in PHP but for Python
    """
    
    def __init__(self):
        self.connection: Optional[mysql.connector.MySQLConnection] = None
        self.cursor = None
        self._connect()
    
    def _connect(self) -> None:
        """
        Establish database connection and test it
        Raises exception if connection fails
        """
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            
            # Set connection attributes similar to PDO settings
            if self.connection.is_connected():
                self.cursor = self.connection.cursor(dictionary=True)
                print("Database connection established successfully")
                
                # Test the connection with a simple query
                self.cursor.execute("SELECT 1")
                self.cursor.fetchone()
                
        except Error as e:
            print(f"Database connection failed: {e}")
            raise Exception(f"Database connection failed: {str(e)}")
    
    def execute_query(self, query: str, params: tuple = None) -> Any:
        """
        Execute a query and return results
        Similar to PDO query execution
        """
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            return self.cursor.fetchall()
        except Error as e:
            print(f"Query execution failed: {e}")
            raise Exception(f"Query execution failed: {str(e)}")
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """
        Execute an insert query and return the last row ID
        Similar to PDO lastInsertId
        """
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            self.connection.commit()
            return self.cursor.lastrowid
        except Error as e:
            print(f"Insert execution failed: {e}")
            self.connection.rollback()
            raise Exception(f"Insert execution failed: {str(e)}")
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """
        Execute an update/delete query and return affected rows count
        Similar to PDO rowCount
        """
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            self.connection.commit()
            return self.cursor.rowcount
        except Error as e:
            print(f"Update execution failed: {e}")
            self.connection.rollback()
            raise Exception(f"Update execution failed: {str(e)}")
    
    def begin_transaction(self) -> None:
        """Start a database transaction"""
        if self.connection:
            self.connection.start_transaction()
    
    def commit_transaction(self) -> None:
        """Commit the current transaction"""
        if self.connection:
            self.connection.commit()
    
    def rollback_transaction(self) -> None:
        """Rollback the current transaction"""
        if self.connection:
            self.connection.rollback()
    
    def close(self) -> None:
        """Close database connection and cursor"""
        if self.cursor:
            self.cursor.close()
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Database connection closed")

# Global database connection instance
_db_connection = None

def get_db_connection() -> DatabaseConnection:
    """
    Get or create a database connection instance
    Singleton pattern to avoid multiple connections
    """
    global _db_connection
    if _db_connection is None:
        _db_connection = DatabaseConnection()
    return _db_connection

def close_db_connection() -> None:
    """Close the global database connection"""
    global _db_connection
    if _db_connection:
        _db_connection.close()
        _db_connection = None

def test_connection() -> Dict[str, Any]:
    """
    Test database connection and return status
    Mimics the PHP connection test functionality
    """
    try:
        db = get_db_connection()
        # Execute a simple test query
        result = db.execute_query("SELECT 1 as test")
        return {
            "success": True,
            "message": "Database connection successful",
            "test_result": result[0]["test"] if result else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Database connection failed: {str(e)}"
        }

# Example usage and testing
if __name__ == "__main__":
    # Test the database connection when script is run directly
    try:
        connection_test = test_connection()
        print(json.dumps(connection_test, indent=2))
        
        # Example query
        db = get_db_connection()
        print("Database connection is ready for use")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        close_db_connection()