import axios from 'axios';

export class BackendHandler {
    backendUrl;
    constructor(backendUrl) {
        console.log('BackendHandler initialized with url: ', backendUrl);
        this.backendUrl = backendUrl;
    }

    getUsers = async () => {
        try {
            const response = await axios.get(this.backendUrl + '/user/all')
            .then((response) => {
                return response.data;
            })
            return response;
        } catch (error) {
            console.error(error);
    }
    }

    addUser = async (username) => {
        const response = await axios.post(this.backendUrl + '/user/create', {name: username})
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error(error);
        })
        return response;
    }

    addPoints = async (username) => {
        const response = await axios.post(this.backendUrl + '/user/points/add', {name: username})
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error(error);
        })
        return response;
    }

    subtractPoints = async (username) => {
        try {
            const response = await axios.post(this.backendUrl + '/user/points/subtract', {name: username})
            .then((response) => {
                return response.data;
            })
            return response;
        } catch (error) {
            console.error(error);
        }
    }

    getCurrentUserNames = async () => {
        const users = await this.getUsers();
        const usernames = users.map(user => user.name);
        return usernames;
    }

    deleteUser = async (username) => {    
        const response = await axios.post(this.backendUrl + '/user/delete', {name: username})
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error(error);
        })
        return response;
    }

    deleteUsersNotOnServer = async (guildMembersNames) => {
        const backendUsernames = await this.getCurrentUserNames();
        const usernamesToDelete = backendUsernames.filter(username => !guildMembersNames.includes(username));
        if(usernamesToDelete.length === 0) {
            return;
        }
        console.log('Deleting users as they are not present on server: ', usernamesToDelete);
        usernamesToDelete.forEach(async (username) => {
            await this.deleteUser(username);
        });
    }

    addUsersNotOnServer = async (guildMembersNames) => {
        const backendUsernames = await this.getCurrentUserNames();
        const usernamesToAdd = guildMembersNames.filter(username => !backendUsernames.includes(username));
        if(usernamesToAdd.length === 0) {
            return;
        }
        console.log('Adding users as they are not present in backend: ', usernamesToAdd);
        usernamesToAdd.forEach(async (username) => {
            await this.addUser(username);
        });
    }
}