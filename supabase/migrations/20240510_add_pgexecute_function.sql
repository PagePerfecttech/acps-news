-- Create a dynamic SQL execution function
-- WARNING: This function has SECURITY DEFINER which means it runs with the
-- permissions of the function creator (typically a superuser).
-- This can be a security risk if not used carefully.

CREATE OR REPLACE FUNCTION pgexecute(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Add a comment to the function to document its purpose and security implications
COMMENT ON FUNCTION pgexecute(text) IS 
'Executes dynamic SQL with superuser privileges. USE WITH EXTREME CAUTION. 
This function should only be used for administrative tasks and should never 
execute user-provided SQL without proper validation.';

-- Create a safer version that returns the result as JSON
CREATE OR REPLACE FUNCTION pgexecute_with_result(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  EXECUTE 'SELECT to_jsonb(t) FROM (' || query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error', SQLERRM,
    'detail', SQLSTATE,
    'query', query
  );
END;
$$;

-- Add a comment to the function to document its purpose and security implications
COMMENT ON FUNCTION pgexecute_with_result(text) IS 
'Executes dynamic SQL with superuser privileges and returns the result as JSON. 
USE WITH EXTREME CAUTION. This function should only be used for administrative 
tasks and should never execute user-provided SQL without proper validation.';

-- Create a function to check if a table exists
CREATE OR REPLACE FUNCTION table_exists(schema_name text, table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = schema_name
    AND tablename = table_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;

-- Create a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION column_exists(schema_name text, table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_val boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = schema_name
    AND table_name = table_name
    AND column_name = column_name
  ) INTO exists_val;
  
  RETURN exists_val;
END;
$$;
