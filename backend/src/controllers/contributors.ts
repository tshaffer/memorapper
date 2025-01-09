import { Request, Response } from 'express';
import { Contributor } from "../types";
import ContributorModel from '../models/Contributor';

export const getContributors = async (request: Request, response: Response) => {
  try {
    const contributors: Contributor[] = await ContributorModel.find({}).exec();
    response.status(200).json({ users: contributors });
    return;
  } catch (error) {
    console.error('Error retrieving users:', error);
    response.status(500).json({ error: 'An error occurred while retrieving contributors.' });
    return;
  }
}

