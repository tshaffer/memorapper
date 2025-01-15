
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

  const { currentAccount } = useUserContext();

  const { open, onSignout, onClose } = props;

  const handleClose = () => {
    onClose();
  };

  const handleSignout = () => {
    onSignout();
    onClose();
  };

  let currentAccountName: string = 'Nobody';

  if (currentAccount) {
    currentAccountName = currentAccount.accountName;
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Account</DialogTitle>
      <DialogContent>
        {currentAccountName}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSignout}>Signout</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AccountDialog;



