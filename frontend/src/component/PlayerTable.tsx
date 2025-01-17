import React, { useCallback, useContext, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Typography from '@mui/material/Typography';
import { TableRowContextMenu } from './TableRowContextMenu';
import { addWhitelist, Player, Team, useCurrentState } from '../api';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { SettingsEditor } from './SettingsEditor';
import { SettingsContext } from '../context/settings';
import { Trans, useTranslation } from 'react-i18next';

export interface PlayerTableProps {
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof Player
    ) => void;
    order: Order;
    orderBy: string;
    enabledColumns: validColumns[];
    readonly players?: Player[];
    readonly matchesOnly?: boolean;
}

const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) => {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
};

type Order = 'asc' | 'desc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getComparator = <Key extends keyof any>(
    order: Order,
    orderBy: Key
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ((a: { [key in Key]: any }, b: { [key in Key]: any }) => number) =>
    order === 'asc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stableSort = <T,>(
    array: readonly T[],
    comparator: (a: T, b: T) => number
) => {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
};

interface HeadCell {
    disablePadding: boolean;
    id: validColumns;
    label: string;
    numeric: boolean;
    tooltip: string;
}

export type validColumns =
    | 'user_id'
    | 'name'
    | 'score'
    | 'kills'
    | 'deaths'
    | 'kpm'
    | 'connected'
    | 'map_time'
    | 'ping'
    | 'health'
    | 'alive';

const headCells: readonly HeadCell[] = [
    {
        id: 'user_id',
        numeric: true,
        disablePadding: false,
        label: 'uid',
        tooltip: 'Players in-Game user id'
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'name',
        tooltip: 'Players current name, as reported by the game server'
    },
    {
        id: 'score',
        numeric: true,
        disablePadding: false,
        label: 'score',
        tooltip: 'Players current score'
    },
    {
        id: 'kills',
        numeric: true,
        disablePadding: false,
        label: 'kills',
        tooltip: 'Players current kills'
    },
    {
        id: 'deaths',
        numeric: true,
        disablePadding: false,
        label: 'deaths',
        tooltip: 'Players current deaths'
    },
    {
        id: 'kpm',
        numeric: true,
        disablePadding: false,
        label: 'kpm',
        tooltip:
            'Players kills per minute. Calculated from when you first see the player in the server, not how long they have actually been in the server'
    },
    {
        id: 'health',
        numeric: true,
        disablePadding: false,
        label: 'health',
        tooltip: 'Shows player current health'
    },
    {
        id: 'connected',
        numeric: true,
        disablePadding: false,
        label: 'time',
        tooltip: 'How long the player has been connected to the server'
    },
    {
        id: 'map_time',
        numeric: true,
        disablePadding: false,
        label: 'map time',
        tooltip: 'How long ist been since you first joined the map'
    },
    {
        id: 'ping',
        numeric: true,
        disablePadding: false,
        label: 'ping',
        tooltip: 'Players current latency'
    }
];

interface ColumnConfigButtonProps {
    enabledColumns: validColumns[];
    setEnabledColumns: (columns: validColumns[]) => void;
}

export const ColumnConfigButton = ({
    setEnabledColumns,
    enabledColumns
}: ColumnConfigButtonProps) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleColumnsChange = (
        _: React.MouseEvent<HTMLElement>,
        newFormats: validColumns[]
    ) => {
        setEnabledColumns(newFormats);
    };

    const open = Boolean(anchorEl);
    return (
        <>
            <IconButton onClick={handleClick}>
                <ViewColumnIcon color={'primary'} />
            </IconButton>
            <Popover
                open={open}
                onClose={handleClose}
                id={'column-config-popover'}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
            >
                <Paper>
                    <Stack>
                        <ToggleButtonGroup
                            color="primary"
                            orientation={'vertical'}
                            value={enabledColumns}
                            onChange={handleColumnsChange}
                            aria-label="Visible Columns"
                        >
                            {headCells.map((r) => {
                                return (
                                    <ToggleButton
                                        name={r.label}
                                        value={r.id}
                                        key={`column-toggle-${r.id}`}
                                    >
                                        <Trans
                                            i18nKey={`player_table.column.${r.id}`}
                                        />
                                    </ToggleButton>
                                );
                            })}
                        </ToggleButtonGroup>
                    </Stack>
                </Paper>
            </Popover>
        </>
    );
};

const PlayerTableHead = ({
    order,
    orderBy,
    onRequestSort,
    enabledColumns
}: PlayerTableProps) => {
    const createSortHandler =
        (property: keyof Player) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells
                    .filter(
                        (c) => enabledColumns.includes(c.id) || !enabledColumns
                    )
                    .map((headCell) => (
                        <Tooltip title={headCell.tooltip} key={headCell.id}>
                            <TableCell
                                align={headCell.numeric ? 'right' : 'left'}
                                padding={
                                    headCell.disablePadding ? 'none' : 'normal'
                                }
                                sortDirection={
                                    orderBy === headCell.id ? order : false
                                }
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={
                                        orderBy === headCell.id ? order : 'asc'
                                    }
                                    onClick={createSortHandler(headCell.id)}
                                >
                                    <Trans
                                        i18nKey={`player_table.column.${headCell.id}`}
                                    />
                                    {orderBy === headCell.id ? (
                                        <Box
                                            component="span"
                                            sx={{ display: 'none' }}
                                        >
                                            {order === 'desc'
                                                ? 'sorted descending'
                                                : 'sorted ascending'}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        </Tooltip>
                    ))}
            </TableRow>
        </TableHead>
    );
};

const getDefaultColumns = (): validColumns[] => {
    const defaultCols: validColumns[] = [
        'user_id',
        'name',
        'score',
        'kills',
        'kpm',
        'deaths',
        'health',
        'connected',
        'ping',
        'alive'
    ];

    const val = localStorage.getItem('enabledColumns');
    if (!val) {
        return defaultCols;
    }
    try {
        const cols = JSON.parse(val);
        if (!cols) {
            return defaultCols;
        }
        return cols;
    } catch (_) {
        return defaultCols;
    }
};

export const PlayerTable = () => {
    const [order, setOrder] = useState<Order>('desc');
    const [orderBy, setOrderBy] = useState<keyof Player>('name');
    const [matchesOnly, setMatchesOnly] = useState(
        // Surely strings are the only types
        JSON.parse(localStorage.getItem('matchesOnly') || 'false') === true
    );
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [enabledColumns, setEnabledColumns] = useState<validColumns[]>(
        getDefaultColumns()
    );
    const { settings } = useContext(SettingsContext);
    const state = useCurrentState();
    const { t } = useTranslation();

    const onWhitelist = useCallback(async (steamId: string) => {
        try {
            await addWhitelist(steamId);
            console.log('Whitelist added');
        } catch (e) {
            console.log(`Error adding whitelist: ${e}`);
        }
    }, []);

    const handleRequestSort = (
        _: React.MouseEvent<unknown>,
        property: keyof Player
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleRows = useMemo(() => {
        const filteredPlayers = state.players.filter(
            (p) => !matchesOnly || (!p.whitelisted && p.matches?.length)
        );
        return stableSort(filteredPlayers, getComparator(order, orderBy));
    }, [order, orderBy, state.players, matchesOnly]);

    const updateSelectedColumns = useCallback(
        (columns: validColumns[]) => {
            setEnabledColumns(columns);
            localStorage.setItem('enabledColumns', JSON.stringify(columns));
        },
        [setEnabledColumns]
    );

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Stack>
                <Stack direction={'row'}>
                    <ButtonGroup>
                        <Tooltip title={t('toolbar.button.show_only_negative')}>
                            <Box>
                                <IconButton
                                    onClick={() => {
                                        setMatchesOnly((prevState) => {
                                            localStorage.setItem(
                                                'matchesOnly',
                                                `${!prevState}`
                                            );
                                            return !prevState;
                                        });
                                    }}
                                >
                                    <FilterListOutlinedIcon color={'primary'} />
                                </IconButton>
                            </Box>
                        </Tooltip>

                        <Tooltip title={t('toolbar.button.shown_columns')}>
                            <Box>
                                <ColumnConfigButton
                                    enabledColumns={enabledColumns}
                                    setEnabledColumns={updateSelectedColumns}
                                />
                            </Box>
                        </Tooltip>

                        <Tooltip title={t('toolbar.button.open_settings')}>
                            <Box>
                                <IconButton
                                    onClick={() => {
                                        setSettingsOpen(true);
                                    }}
                                >
                                    <SettingsOutlinedIcon color={'primary'} />
                                </IconButton>
                            </Box>
                        </Tooltip>

                        <Tooltip
                            title={t(
                                state.game_running
                                    ? 'toolbar.button.game_state_running'
                                    : 'toolbar.button.game_state_stopped'
                            )}
                        >
                            <Box>
                                <IconButton
                                    disableRipple
                                    color={
                                        state.game_running ? 'success' : 'error'
                                    }
                                    onClick={() => {}}
                                >
                                    {state.game_running ? (
                                        <PlayArrowIcon />
                                    ) : (
                                        <StopIcon />
                                    )}
                                </IconButton>
                            </Box>
                        </Tooltip>
                    </ButtonGroup>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center' }}
                        paddingLeft={1}
                    >
                        <Typography
                            variant={'button'}
                            style={{ color: '#004ec2' }}
                        >
                            {
                                state.players.filter(
                                    (p) => p.team == Team.BLU && p.is_connected
                                ).length
                            }
                        </Typography>
                        <Typography
                            variant={'button'}
                            style={{ paddingLeft: 3, paddingRight: 3 }}
                        >
                            :
                        </Typography>
                        <Typography
                            variant={'button'}
                            style={{ color: '#b40a2a' }}
                        >
                            {
                                state.players.filter(
                                    (p) => p.team == Team.RED && p.is_connected
                                ).length
                            }
                        </Typography>
                    </Box>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center' }}
                        paddingLeft={2}
                    >
                        <Typography variant={'h1'}>
                            {state.server.server_name}
                        </Typography>
                    </Box>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center' }}
                        paddingLeft={2}
                    >
                        <Typography variant={'subtitle1'} paddingRight={1}>
                            {state.server.current_map}
                        </Typography>
                    </Box>
                </Stack>
                <TableContainer sx={{ overflow: 'hidden' }}>
                    <Table
                        aria-label="Player table"
                        size="small"
                        padding={'none'}
                    >
                        <PlayerTableHead
                            players={state.players}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            enabledColumns={enabledColumns}
                        />

                        <TableBody>
                            {visibleRows.map((player, i) => (
                                <TableRowContextMenu
                                    enabledColumns={enabledColumns}
                                    onWhitelist={onWhitelist}
                                    player={player}
                                    key={`row-${i}-${player.steam_id}`}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <SettingsEditor
                    open={settingsOpen}
                    setOpen={setSettingsOpen}
                    origSettings={settings}
                />
            </Stack>
        </Paper>
    );
};
