// 1. Modify this file to use our own running server instead of running fakerest. 
// 2.  Refer https://github.com/marmelab/FakeRest/blob/master/src/Server.js
import FakeRest from 'fakerest';
import { DataProvider } from 'ra-core';

export default (data, _loggingEnabled = false): DataProvider => {
    /* 
     3. This is the main entry point of the Server.   
     4. We need to tweak the files here https://github.com/marmelab/FakeRest/tree/master/src  in order to initialize our server
     5. Once we are successful in making restServer (line 14) by changing it to our server then all other things must remain same.
     6. Already copied them in custom_server folder. 
    */ 

    const restServer = new FakeRest.Server();

    restServer.init(data);
    if (typeof window !== 'undefined') {
        // give way to update data in the console
        (window as any).restServer = restServer;
    }

    function getResponse(type, resource, params) {
        switch (type) {
            case 'getList': {
                const { page, perPage } = params.pagination;
                const { field, order } = params.sort;
                const query = {
                    sort: [field, order],
                    range: [(page - 1) * perPage, page * perPage - 1],
                    filter: params.filter,
                };
                return {
                    data: restServer.getAll(resource, query),
                    total: restServer.getCount(resource, {
                        filter: params.filter,
                    }),
                };
            }
            case 'getOne':
                return {
                    data: restServer.getOne(resource, params.id, { ...params }),
                };
            case 'getMany':
                return {
                    data: restServer.getAll(resource, {
                        filter: { id: params.ids },
                    }),
                };
            case 'getManyReference': {
                const { page, perPage } = params.pagination;
                const { field, order } = params.sort;
                const query = {
                    sort: [field, order],
                    range: [(page - 1) * perPage, page * perPage - 1],
                    filter: { ...params.filter, [params.target]: params.id },
                };
                return {
                    data: restServer.getAll(resource, query),
                    total: restServer.getCount(resource, {
                        filter: query.filter,
                    }),
                };
            }
            case 'update':
                return {
                    data: restServer.updateOne(resource, params.id, {
                        ...params.data,
                    }),
                };
            case 'updateMany':
                params.ids.forEach(id =>
                    restServer.updateOne(resource, id, {
                        ...params.data,
                    })
                );
                return { data: params.ids };
            case 'create':
                return {
                    data: restServer.addOne(resource, { ...params.data }),
                };
            case 'delete':
                return { data: restServer.removeOne(resource, params.id) };
            case 'deleteMany':
                params.ids.forEach(id => restServer.removeOne(resource, id));
                return { data: params.ids };
            default:
                return false;
        }
    }

    /**
     * @param {String} type One of the data Provider methods, e.g. 'getList'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The data request params, depending on the type
     * @returns {Promise} The response
     */
    const handle = (type, resource, params): Promise<any> => {
        const collection = restServer.getCollection(resource);
        if (!collection && type !== 'create') {
            const error = new UndefinedResourceError(
                `Undefined collection "${resource}"`
            );
            error.code = 1; // make that error detectable
            return Promise.reject(error);
        }
        let response;
        try {
            response = getResponse(type, resource, params);
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
        return Promise.resolve(response);
    };

    return {
        getList: (resource, params) => handle('getList', resource, params),
        getOne: (resource, params) => handle('getOne', resource, params),
        getMany: (resource, params) => handle('getMany', resource, params),
        getManyReference: (resource, params) =>
            handle('getManyReference', resource, params),
        update: (resource, params) => handle('update', resource, params),
        updateMany: (resource, params) =>
            handle('updateMany', resource, params),
        create: (resource, params) => handle('create', resource, params),
        delete: (resource, params) => handle('delete', resource, params),
        deleteMany: (resource, params) =>
            handle('deleteMany', resource, params),
    };
};

class UndefinedResourceError extends Error {
    code: number;
}
