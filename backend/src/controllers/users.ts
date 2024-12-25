import { Request, Response } from 'express';
import { UserEntity } from "../types";
import UserModel from '../models/User';

export const getUsers = async (request: Request, response: Response) => {
  try {
    const users: UserEntity[] = await UserModel.find({}).exec();
    response.status(200).json({ users });
    return;
  } catch (error) {
    console.error('Error retrieving users:', error);
    response.status(500).json({ error: 'An error occurred while retrieving users.' });
    return;
  }
}

