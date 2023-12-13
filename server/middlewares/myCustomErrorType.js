class MyCustomErrorType extends Error {
    constructor(message) {
        super(message);
        this.name = 'MyCustomErrorType';
    }
}

module.exports = MyCustomErrorType;