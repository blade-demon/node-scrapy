const request = require('superagent');

module.exports = {
    fetchDataGet: function(url, queryParams) {
        return new Promise((resolve, reject) => {
            request.get(url)
                .set("Accept", "application/json")
                .query(queryParams)
                .end((error, result) => {
                    console.log(result.statusCode);
                    error ? reject(error) : resolve(result);
                });
        });
    },
    fetchDataPost: function(url, data, header) {
        return new Promise((resolve, reject) => {
            request.post(url)
                .set(header)
                .send(data)
                .end((err, result) => {
                    error ? reject(error) : resolve(result)
                });
        });
    }
}