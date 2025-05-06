import { supabase } from './supabase';
import { isSupabaseConfigured } from './supabase';
import { User } from '../types';

// Default users for demo
const defaultUsers: User[] = [
  {
    id: '1',
    email: 'admin@flipnews.com',
    name: 'Admin User',
    role: 'admin',
    profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    created_at: new Date().toISOString()
  },
];

// Initialize users in localStorage if they don't exist
const initializeUsers = (): void => {
  if (typeof window === 'undefined') return; // Skip on server-side

  if (!localStorage.getItem('flipnews_users')) {
    localStorage.setItem('flipnews_users', JSON.stringify(defaultUsers));
  }
};

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    // Check if using Supabase
    const usingSupabase = await isSupabaseConfigured();

    if (usingSupabase) {
      try {
        // Try to get users from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching users from Supabase:', error);
          // Fall back to localStorage
          return getLocalUsers();
        }

        if (data && Array.isArray(data)) {
          return data as User[];
        } else {
          console.log('No users found in Supabase or invalid data format, using localStorage');
          return getLocalUsers();
        }
      } catch (error) {
        console.error('Error in getUsers:', error);
        // Fall back to localStorage
        return getLocalUsers();
      }
    } else {
      // Use localStorage
      console.log('Supabase not configured, using localStorage for users');
      return getLocalUsers();
    }
  } catch (error) {
    console.error('Unexpected error in getUsers:', error);
    // Fall back to default users in case of any error
    return defaultUsers;
  }
};

// Get users from localStorage
const getLocalUsers = (): User[] => {
  if (typeof window === 'undefined') {
    // Return default users on server-side
    return defaultUsers;
  }

  initializeUsers();
  const users = localStorage.getItem('flipnews_users');
  return users ? JSON.parse(users) : defaultUsers;
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    // Check if using Supabase
    const usingSupabase = await isSupabaseConfigured();

    if (usingSupabase) {
      try {
        // Try to get user from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching user from Supabase:', error);
          // Fall back to localStorage
          return getLocalUserById(id);
        }

        if (data) {
          return data as User;
        } else {
          console.log(`User with ID ${id} not found in Supabase, checking localStorage`);
          return getLocalUserById(id);
        }
      } catch (error) {
        console.error('Error in getUserById:', error);
        // Fall back to localStorage
        return getLocalUserById(id);
      }
    } else {
      // Use localStorage
      console.log('Supabase not configured, using localStorage for user lookup');
      return getLocalUserById(id);
    }
  } catch (error) {
    console.error('Unexpected error in getUserById:', error);
    // Try to find in default users as a last resort
    if (typeof window === 'undefined') {
      return defaultUsers.find(user => user.id === id) || null;
    }
    return null;
  }
};

// Get user by ID from localStorage
const getLocalUserById = (id: string): User | null => {
  if (typeof window === 'undefined') {
    // Try to find in default users on server-side
    return defaultUsers.find(user => user.id === id) || null;
  }

  initializeUsers();
  const users = localStorage.getItem('flipnews_users');
  const parsedUsers = users ? JSON.parse(users) : defaultUsers;
  return parsedUsers.find((user: User) => user.id === id) || null;
};

// Add a new user
export const addUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User | null> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      // Add user to Supabase
      const newUser = {
        ...user,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        console.error('Error adding user to Supabase:', error);
        // Fall back to localStorage
        return addLocalUser(user);
      }

      return data as User;
    } catch (error) {
      console.error('Error in addUser:', error);
      // Fall back to localStorage
      return addLocalUser(user);
    }
  } else {
    // Use localStorage
    return addLocalUser(user);
  }
};

// Add a user to localStorage
const addLocalUser = (user: Omit<User, 'id' | 'created_at'>): User | null => {
  if (typeof window === 'undefined') return null; // Can't update on server-side

  try {
    initializeUsers();
    const users = localStorage.getItem('flipnews_users');
    const parsedUsers = users ? JSON.parse(users) : defaultUsers;

    // Check if email already exists
    const emailExists = parsedUsers.some((u: User) => u.email === user.email);
    if (emailExists) {
      console.error('User with this email already exists');
      return null;
    }

    // Create new user
    const newUser: User = {
      ...user,
      id: `${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Add to users array
    parsedUsers.push(newUser);
    localStorage.setItem('flipnews_users', JSON.stringify(parsedUsers));

    return newUser;
  } catch (error) {
    console.error('Error adding user to localStorage:', error);
    return null;
  }
};

// Update a user
export const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        // Fall back to localStorage
        return updateLocalUser(id, userData);
      }

      return true;
    } catch (error) {
      console.error('Error in updateUser:', error);
      // Fall back to localStorage
      return updateLocalUser(id, userData);
    }
  } else {
    // Use localStorage
    return updateLocalUser(id, userData);
  }
};

// Update a user in localStorage
const updateLocalUser = (id: string, userData: Partial<User>): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    initializeUsers();
    const users = localStorage.getItem('flipnews_users');
    const parsedUsers = users ? JSON.parse(users) : defaultUsers;

    // Find user index
    const userIndex = parsedUsers.findIndex((user: User) => user.id === id);
    if (userIndex === -1) {
      console.error('User not found');
      return false;
    }

    // Update user
    parsedUsers[userIndex] = {
      ...parsedUsers[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('flipnews_users', JSON.stringify(parsedUsers));
    return true;
  } catch (error) {
    console.error('Error updating user in localStorage:', error);
    return false;
  }
};

// Delete a user
export const deleteUser = async (id: string): Promise<boolean> => {
  // Check if using Supabase
  const usingSupabase = await isSupabaseConfigured();

  if (usingSupabase) {
    try {
      // Delete user from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        // Fall back to localStorage
        return deleteLocalUser(id);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      // Fall back to localStorage
      return deleteLocalUser(id);
    }
  } else {
    // Use localStorage
    return deleteLocalUser(id);
  }
};

// Delete a user from localStorage
const deleteLocalUser = (id: string): boolean => {
  if (typeof window === 'undefined') return false; // Can't update on server-side

  try {
    initializeUsers();
    const users = localStorage.getItem('flipnews_users');
    const parsedUsers = users ? JSON.parse(users) : defaultUsers;

    // Filter out the user
    const filteredUsers = parsedUsers.filter((user: User) => user.id !== id);

    localStorage.setItem('flipnews_users', JSON.stringify(filteredUsers));
    return true;
  } catch (error) {
    console.error('Error deleting user from localStorage:', error);
    return false;
  }
};
