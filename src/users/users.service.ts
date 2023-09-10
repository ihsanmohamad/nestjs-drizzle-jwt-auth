import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq, and, ne, gte, DBQueryConfig, desc, sql } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

export type User = typeof schema.users.$inferSelect;
export type UserRole = typeof schema.user_role.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type UserWithRole = Omit<User, 'role_id'> & {
  user_role: UserRole;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(PG_CONNECTION) private conn: NodePgDatabase<typeof schema>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const newUser = { ...createUserDto, password_hash: hashedPassword };
    return await this.conn
      .insert(schema.users)
      .values({ id: schema.users.id.default, ...newUser })
      .returning()
      .catch((err) =>
        err.code == 23505
          ? 'Email or username already taken'
          : 'Something happened',
      );
    // return await this.conn
    //   .insert(schema.users)
    //   .values(createUserDto)
    //   .then(
    //     (res) => 'User created successfully',
    //     (err) => {
    //       return err.code == 23505
    //         ? 'Email already taken'
    //         : 'Something happened';
    //     },
    //   );
  }

  async findAll({
    limit,
    cursor,
  }: { limit?: number; cursor?: Date } = {}): Promise<any> {
    const queryOptions: DBQueryConfig<'many'> = {
      with: { user_role: true },
      orderBy: [schema.users.createdAt, desc(schema.users.id)],
      columns: {
        role_id: false,
        password_hash: false,
        createdAt: false,
        updatedAt: false,
      },
      where: ne(schema.users.role_id, 1),
    };

    if (limit !== undefined) {
      queryOptions.limit = limit;
    }

    if (cursor !== undefined) {
      // queryOptions.where = gt(schema.users.id, cursor);
      // cursor.setMilliseconds(cursor.getMilliseconds() + 1000);
      cursor.setSeconds(cursor.getSeconds() + 1);
      queryOptions.where = and(
        // and(
        //   ne(schema.users.createdAt, cursor),
        //   gt(schema.users.createdAt, cursor),
        // ),
        gte(schema.users.createdAt, cursor),
        ne(schema.users.role_id, 1),
      );
    }

    const result = await this.conn
      .select({ count: sql<number>`count(*)` })
      .from(schema.users)
      .where(ne(schema.users.role_id, 1));
    const totalUsers = result[0].count;
    console.log(totalUsers);
    return await this.conn.query.users.findMany(queryOptions);

    // return await this.conn.query.users.findMany({
    //   where: gt(schema.users.id, cursor),
    //   with: { user_role: true },
    //   columns: {
    //     role_id: false,
    //   },
    //   orderBy: schema.users.id,
    //   limit: limit,
    // });
  }

  async findOne(id: string) {
    return await this.conn.query.users
      .findFirst({
        with: {
          user_role: true,
          profile: { columns: { id: false, userId: false } },
        },
        where: eq(schema.users.id, id),
        columns: {
          role_id: false,
        },
      })
      .then((res) => (res ? res : `User does not exist`));
  }

  async findOneByEmail(email: string) {
    return await this.conn.query.users
      .findFirst({
        with: { user_role: true },
        where: eq(schema.users.email, email),
        columns: {
          role_id: false,
        },
      })
      .then((res) => (res ? res : `User does not exist`));
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.conn
      .update(schema.users)
      .set(updateUserDto)
      .where(eq(schema.users.id, id))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        role_id: schema.users.role_id,
      })
      .catch((err) =>
        err.code == 23505 ? 'Email already taken' : 'Something happened',
      );
  }

  async remove(id: string) {
    return await this.conn
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .then((res) =>
        res.rowCount > 0 ? 'User deleted' : `User does not exist`,
      );
  }

  async getEmailOnly() {
    const emailData = await this.conn
      .select({
        email: schema.users.email,
      })
      .from(schema.users);
    return emailData.map((d) => d.email);
  }

  async hashPassword(plain: string): Promise<string> {
    const saltRounds = 10;
    const hashed: string = await bcrypt.hash(plain, saltRounds);
    return hashed;
  }
}
