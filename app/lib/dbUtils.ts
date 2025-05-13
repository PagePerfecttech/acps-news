/**
 * Database utility functions for executing dynamic SQL
 * 
 * SECURITY WARNING: These functions execute SQL directly.
 * Only use them with trusted input, never with user-provided data.
 */

import { supabase } from './supabase';

/**
 * Execute a SQL query using the pgexecute function
 * @param query SQL query to execute
 * @returns Promise that resolves when the query is executed
 */
export const executeSql = async (query: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('pgexecute', { query });
    
    if (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
    
    console.log('SQL executed successfully');
  } catch (error) {
    console.error('Exception executing SQL:', error);
    throw error;
  }
};

/**
 * Execute a SQL query and return the result
 * @param query SQL query to execute
 * @returns Promise that resolves with the query result
 */
export const executeSqlWithResult = async <T = any>(query: string): Promise<T> => {
  try {
    const { data, error } = await supabase.rpc('pgexecute_with_result', { query });
    
    if (error) {
      console.error('Error executing SQL with result:', error);
      throw error;
    }
    
    if (data && 'error' in data) {
      console.error('SQL error:', data.error);
      throw new Error(`SQL error: ${data.error}`);
    }
    
    return data as T;
  } catch (error) {
    console.error('Exception executing SQL with result:', error);
    throw error;
  }
};

/**
 * Check if a table exists in the database
 * @param schema Schema name (default: 'public')
 * @param table Table name
 * @returns Promise that resolves with boolean indicating if table exists
 */
export const tableExists = async (table: string, schema: string = 'public'): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('table_exists', { 
      schema_name: schema,
      table_name: table
    });
    
    if (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking if table exists:', error);
    return false;
  }
};

/**
 * Check if a column exists in a table
 * @param table Table name
 * @param column Column name
 * @param schema Schema name (default: 'public')
 * @returns Promise that resolves with boolean indicating if column exists
 */
export const columnExists = async (
  table: string, 
  column: string, 
  schema: string = 'public'
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('column_exists', { 
      schema_name: schema,
      table_name: table,
      column_name: column
    });
    
    if (error) {
      console.error('Error checking if column exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking if column exists:', error);
    return false;
  }
};

/**
 * Create a table if it doesn't exist
 * @param tableName Table name
 * @param columns Column definitions
 * @returns Promise that resolves when the operation is complete
 */
export const createTableIfNotExists = async (
  tableName: string, 
  columns: string
): Promise<void> => {
  try {
    const exists = await tableExists(tableName);
    
    if (!exists) {
      const query = `
        CREATE TABLE ${tableName} (
          ${columns}
        );
      `;
      
      await executeSql(query);
      console.log(`Table ${tableName} created successfully`);
    } else {
      console.log(`Table ${tableName} already exists`);
    }
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Add a column to a table if it doesn't exist
 * @param tableName Table name
 * @param columnName Column name
 * @param columnDefinition Column definition (e.g., "TEXT NOT NULL")
 * @returns Promise that resolves when the operation is complete
 */
export const addColumnIfNotExists = async (
  tableName: string,
  columnName: string,
  columnDefinition: string
): Promise<void> => {
  try {
    const exists = await columnExists(tableName, columnName);
    
    if (!exists) {
      const query = `
        ALTER TABLE ${tableName}
        ADD COLUMN ${columnName} ${columnDefinition};
      `;
      
      await executeSql(query);
      console.log(`Column ${columnName} added to ${tableName} successfully`);
    } else {
      console.log(`Column ${columnName} already exists in ${tableName}`);
    }
  } catch (error) {
    console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    throw error;
  }
};
