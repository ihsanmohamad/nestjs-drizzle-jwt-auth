import {
  integer,
  serial,
  text,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('user', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email').unique(),
  username: text('username').unique(),
  password_hash: text('password_hash').notNull(),
  role_id: integer('role_id').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const user_role = pgTable('user_role', {
  id: serial('id').primaryKey(),
  name: text('name'),
});

export const profile = pgTable('profile', {
  id: varchar('id', { length: 128 })
    .primaryKey()
    .$defaultFn(() => createId()),
  plan: text('plan').default('free'),
  firstName: text('first_name'),
  userId: varchar('user_id', { length: 128 }).references(() => users.id),
});

export const usersRelations = relations(users, ({ one }) => ({
  user_role: one(user_role, {
    fields: [users.role_id],
    references: [user_role.id],
  }),
  profile: one(profile, {
    fields: [users.id],
    references: [profile.userId],
  }),
}));

export const insertUsersZod = createInsertSchema(users);
export const selectUsersZod = createSelectSchema(users);
export const insertUserRoleZod = createInsertSchema(user_role);
export const selecttUserRoleZod = createInsertSchema(user_role);
