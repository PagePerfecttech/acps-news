-- Create a simple function to check if the service is running
CREATE OR REPLACE FUNCTION get_service_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN jsonb_build_object(
    'status', 'ok',
    'timestamp', extract(epoch from now()),
    'version', '1.0.0'
  );
END;
$$;
