import { List } from '../api';
import React, { ChangeEvent, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import {
    Button,
    Checkbox,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { inputValidator } from './SettingsEditor';
import Typography from '@mui/material/Typography';

interface SettingsListProps {
    value: List;
    setValue: (value: List) => void;
    validator?: inputValidator;
    open: boolean;
    setOpen: (open: boolean) => void;
    isNew: boolean;
}

export const SettingsListEditor = ({
    value,
    setValue,
    open,
    setOpen,
    isNew
}: SettingsListProps) => {
    const [list, setList] = useState<List>({ ...value });

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        setValue(list);
        handleClose();
    };

    const onEnabledChanged = (
        _: ChangeEvent<HTMLInputElement>,
        enabled: boolean
    ) => {
        setList({ ...list, enabled });
    };

    const onNameChanged = (event: ChangeEvent<HTMLInputElement>) => {
        setList({ ...list, name: event.target.value });
    };

    const onUrlChanged = (event: ChangeEvent<HTMLInputElement>) => {
        setList({ ...list, url: event.target.value });
    };

    return (
        <Dialog open={open}>
            <DialogTitle component={Typography} variant={'h1'}>
                {isNew ? `Create New List` : `Edit List: ${list.name}`}
            </DialogTitle>
            <DialogContent dividers>
                <Stack>
                    <Checkbox
                        checked={list.enabled}
                        onChange={onEnabledChanged}
                    />
                    <TextField value={list.name} onChange={onNameChanged} />
                    <TextField
                        fullWidth
                        value={list.url}
                        onChange={onUrlChanged}
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleClose}
                    startIcon={<CloseIcon />}
                    color={'error'}
                    variant={'contained'}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    startIcon={<CheckIcon />}
                    color={'success'}
                    variant={'contained'}
                >
                    Accept
                </Button>
            </DialogActions>
        </Dialog>
    );
};