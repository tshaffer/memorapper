
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import Button from '@mui/material/Button';
import { useUserContext } from '../contexts/UserContext';

export interface DiningGroupDialogPropsFromParent {
  open: boolean;
  onSignout: () => void;
  onClose: () => void;
}

export interface DiningGroupDialogProps extends DiningGroupDialogPropsFromParent {
}

function DiningGroupDialog(props: DiningGroupDialogProps) {

  const { currentDiningGroup } = useUserContext();

  const { open, onSignout, onClose } = props;

  const handleClose = () => {
    onClose();
  };

  const handleSignout = () => {
    onSignout();
    onClose();
  };

  let currentDiningGroupName: string = 'Nobody';

  if (currentDiningGroup) {
    currentDiningGroupName = currentDiningGroup.diningGroupName;
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Dining Group</DialogTitle>
      <DialogContent>
        {currentDiningGroupName}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSignout}>Signout</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DiningGroupDialog;



