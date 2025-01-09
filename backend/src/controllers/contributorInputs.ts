import { Request, Response } from 'express';
import { ContributorInput } from "../types";
import ContributorInputModel from '../models/ContributorInput';

export const getContributorInputs = async (request: Request, response: Response) => {
  try {
    const contributorInputs: ContributorInput[] = await ContributorInputModel.find({}).exec();
    response.status(200).json({ users: contributorInputs });
    return;
  } catch (error) {
    console.error('Error retrieving users:', error);
    response.status(500).json({ error: 'An error occurred while retrieving contributorInputs.' });
    return;
  }
}

