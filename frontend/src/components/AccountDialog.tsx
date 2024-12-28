
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

import Button from '@mui/material/Button';
import { useUserContext } from '../contexts/UserContext';

export interface AccountDialogPropsFromParent {
  open: boolean;
  onSignout: () => void;
  onClose: () => void;
}

export interface AccountDialogProps extends AccountDialogPropsFromParent {
}

function AccountDialog(props: AccountDialogProps) {

  const { currentUser } = useUserContext();

  const { open, onSignout, onClose } = props;

  const handleClose = () => {
    onClose();
  };

  const handleSignout = () => {
    onSignout();
    onClose();
  };

  let currentUserName: string = 'Nobody';
  let currentEmailAddress: string = 'nobody@nowhere.com';

  if (currentUser) {
    currentUserName = currentUser.userName;
    currentEmailAddress = currentUser.email;
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Account</DialogTitle>
      <DialogContent>
        {currentUserName}
        <br />
        {currentEmailAddress}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSignout}>Signout</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AccountDialog;



