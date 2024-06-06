import { eq } from "drizzle-orm";
import db from "../db";
import { User } from "../db/schema";

export const createUser = async () => {
    const userData = await db.insert(User).values({
        firstName: "Shohanur",
        lastName: "Rahman",
        email: "shohanurr590@gmail.com",
        password: "12345"
    });

    return userData;
};

export const getUsers = async () => {

    // Fetching all columns
    // return await db.query.user.findMany(); // ORM like query
    // return db.select().from(user); // Query builder like query

    // Fetching selected columns using ORM
    // return await db.query.user.findMany({
    //     columns: {
    //         id: true,
    //         email: true,

    //     }
    // }); 

    // Fetching selected columns using query builder
    return db
        .select({
            id: User.id,
            email: User.email
        })
        .from(User);
};

export const getSingleUser = async (userId: number) => {
    // const user = await db.query.User.findFirst({
    //     where: eq(User.id, userId)
    // });

    // const user = await db
    //     .select()
    //     .from(User)
    //     .where(eq(User.id, userId))

    // return user[0];

    const user = await db.query.User.findFirst({
        columns: {
            id: true,
            email: true
        },
        where: eq(User.id, userId)
    });

    return user;
};

export const updateSingleUser = async (userId: number) => {
    await db.update(User)
        .set({ lastName: 'Dann' })
        .where(eq(User.id, userId));
};

