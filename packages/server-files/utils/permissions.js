// server_packages/utils/permissions.js

module.exports = {
    hasAdminLevel: (player, level) => {
        if (!player || !player.data || typeof player.data.admin !== 'number') return false;
        return player.data.admin >= level;
    }
};
