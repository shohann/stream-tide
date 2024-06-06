import { NextFunction, Request, Response } from "express";
import { createUser, getUsers, getSingleUser, updateSingleUser } from "../service/user.service";

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createUser();
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error)
        console.log(error);
    }
};

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getUsers();
        res.status(200).send(users)
    } catch (error) {
        console.log(error);
    }
};

export const getSingleUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.user_id as string;
        const user = await getSingleUser(parseInt(userId));
        res.status(200).send(user);
    } catch (error) {
        console.log(error);
    }
};

export const updateSingleUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.user_id as string;
        await updateSingleUser(parseInt(userId));
        res.status(200).send();
    } catch (error) {
        console.log(error);
    }
};