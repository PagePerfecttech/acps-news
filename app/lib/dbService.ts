/**
 * Database service functions using Drizzle ORM
 * Replaces supabaseService.ts for database operations
 */

import { db } from './db';
import { newsArticles } from './schema';
import { eq, sql } from 'drizzle-orm';

// Increment view count for an article
export const incrementViewCount = async (articleId: string): Promise<boolean> => {
    try {
        await db
            .update(newsArticles)
            .set({ views: sql`${newsArticles.views} + 1` })
            .where(eq(newsArticles.id, articleId));

        return true;
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return false;
    }
};

// Like an article
export const likeArticle = async (articleId: string, ipAddress: string): Promise<boolean> => {
    try {
        // For now, just increment the likes count
        // In a full implementation, you'd want to track individual likes in a separate table
        await db
            .update(newsArticles)
            .set({ likes: sql`${newsArticles.likes} + 1` })
            .where(eq(newsArticles.id, articleId));

        return true;
    } catch (error) {
        console.error('Error liking article:', error);
        return false;
    }
};
