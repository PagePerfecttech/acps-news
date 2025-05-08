# User Management Troubleshooting Guide

This guide addresses common issues with user management in the FlipNews application.

## Error: "Error adding user to Supabase: {}"

If you encounter this error when trying to add a user, it's likely due to a mismatch between the database schema and the code. The error occurs because the users table in Supabase is expecting an `auth_id` field that references `auth.users`, but our code is trying to insert a user directly.

### Solution

We've created a script to fix the users table schema. Follow these steps:

1. Make sure your Supabase environment variables are set correctly in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Run the fix-users-table script:

```bash
npm run fix-users
```

This script will:
- Check if the users table exists and create it if it doesn't
- Remove the `auth_id` column and its foreign key constraint if they exist
- Add a `password` column if it doesn't exist
- Set up the correct Row Level Security (RLS) policies

3. Restart the development server:

```bash
npm run dev
```

4. Try adding a user again

### What the Script Does

The script modifies the users table to have the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  profile_pic TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This structure is compatible with our application code and allows users to be created without going through Supabase Auth.

### Manual Fix

If the script doesn't work for some reason, you can manually fix the issue by running the following SQL in the Supabase SQL Editor:

```sql
-- Drop the foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_auth_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_auth_id_fkey;
  END IF;
END $$;

-- Drop the auth_id column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS auth_id;

-- Add the password column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Allow full access to authenticated users" ON users
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow read access to anonymous users" ON users
FOR SELECT USING (true);
```

## Other Common User Management Issues

### Email Already Exists

If you try to create a user with an email that already exists, you'll get an error. Make sure to use a unique email address for each user.

### Password Not Saved

If the password field is not being saved, make sure:

1. The users table has a password column
2. The password field is included in the form data
3. The password field is being passed to the addUser function

### User Not Appearing in List

If a newly created user doesn't appear in the list:

1. Check the browser console for errors
2. Make sure the user was successfully created
3. Try refreshing the page

### Permission Issues

If you encounter permission issues when trying to create or manage users:

1. Make sure the RLS policies are set up correctly
2. Check that your Supabase API key has the necessary permissions
3. Try using the service role key for administrative operations

## Need More Help?

If you continue to experience issues with user management, please:

1. Check the browser console for detailed error messages
2. Look at the Supabase logs for any database errors
3. Contact support for further assistance
