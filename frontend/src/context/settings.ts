import { createContext } from 'react';
import { UserSettings } from '../api';

export const defaultUserSettings: UserSettings = {
    steam_id: '',
    steam_dir: '',
    tf2_dir: '',
    auto_launch_game: false,
    auto_close_on_game_exit: false,
    api_key: '',
    disconnected_timeout: '',
    discord_presence_enabled: false,
    kicker_enabled: false,
    chat_warnings_enabled: false,
    party_warnings_enabled: true,
    kick_tags: [],
    voice_bans_enabled: true,
    debug_log_enabled: true,
    lists: [],
    links: [
        {
            enabled: true,
            name: 'Steam',
            url: 'https://steamcommunity.com/profiles/%d',
            id_format: 'steam64',
            deleted: false
        }
    ],
    rcon_static: true,
    gui_enabled: true,
    http_enabled: true,
    http_listen_addr: 'localhost:8900',
    player_expired_timeout: 6,
    player_disconnect_timeout: 20,
    unique_tags: []
};

interface SettingsContextProps {
    settings: UserSettings;
    loading: boolean;
}

export const SettingsContext = createContext<SettingsContextProps>({
    loading: false,
    settings: defaultUserSettings
});
