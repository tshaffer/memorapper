import React from 'react';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import { Contributor, ContributorInput } from '../types';

import '../styles/reviewEntryForm.css';

interface RatingsAndCommentsProps {
  contributors: Contributor[]; // Array of contributors associated with the user
  contributorInputs: ContributorInput[]; // Existing ratings and comments
  onContributorInputChange: (
    contributorId: string,
    field: 'rating' | 'comments',
    value: number | string
  ) => void;
}

const RatingsAndComments: React.FC<RatingsAndCommentsProps> = ({
  contributors,
  contributorInputs,
  onContributorInputChange,
}) => {
  const renderRatingsAndComments = (): JSX.Element => (
    <fieldset className="ratings-comments-section">
      <legend>Ratings and Comments by Contributors</legend>
      {contributors.map((contributor) => {
        const input = contributorInputs.find(
          (ci) => ci.contributorId === contributor.id
        ) || { rating: 0, comments: '' };

        return (
          <div key={contributor.id} className="contributor-section">
            <div className="contributor-header">
              <h4>{contributor.name}</h4>
            </div>
            <div className="contributor-rating">
              <label htmlFor={`rating-${contributor.id}`}>Rating</label>
              <Rating
                id={`rating-${contributor.id}`}
                name={`rating-${contributor.id}`}
                value={input.rating}
                max={5}
                onChange={(event, newValue) =>
                  onContributorInputChange(contributor.id, 'rating', newValue || 0)
                }
              />
            </div>
            <div className="contributor-comments">
              <label htmlFor={`comments-${contributor.id}`}>Comments</label>
              <TextField
                id={`comments-${contributor.id}`}
                name={`comments-${contributor.id}`}
                fullWidth
                multiline
                rows={3}
                value={input.comments}
                onChange={(event) =>
                  onContributorInputChange(contributor.id, 'comments', event.target.value)
                }
              />
            </div>
          </div>
        );
      })}
    </fieldset>
  );

  return (
    <div className="ratings-and-comments">
      {renderRatingsAndComments()}
    </div>
  );
};

export default RatingsAndComments;
