angular.module('reg')
    .factory('FileService', [
        '$http',
        function ($http) {

            var base = '/api/file/';

            return {
                uploadFile: function (id, metadata, file) {
                    return $http.put(base + id + '/upload', {
                        metadata: metadata,
                        file: file
                    });
                },

                updateFile: function (id, fileId, metadata, file) {
                    return $http.put(base + id + '/update', {
                        fileId: fileId,
                        metadata: metadata,
                        file: file
                    });
                }
            };
        }
    ]);
