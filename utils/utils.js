
const isValidEnvelopeBody = (body) => {
    const expectedProperties = ['id', 'title', 'budget', 'user_id'];

    return expectedProperties.every(prop => {
        // Check if the property exists
        if (!Object.prototype.hasOwnProperty.call(body, prop)) {
            return false;
        }

        // Check the type of the property
        if ((prop === 'id' || prop === 'title' || prop === 'user_id') && typeof body[prop] !== 'string') {
            return false;
        }

        // Additional checks for the length of id and user_id
        if ((prop === 'id' || prop === 'user_id') && body[prop].length > 3) {
            return false;
        }
        
        // Check for the length of title
        if (prop === 'title' && body[prop].length > 20) {
            return false;
        }

        // Check for the budget to be integer
        if (prop === 'budget' && !Number.isInteger(body[prop])) {
            return false;
        }

        return true;
    });
};

const isValidUpdateBody = (body) => {
    const expectedProperties = ['title', 'budget', 'user_id'];

    return expectedProperties.every(prop => {
        // Check if the property exists
        if (!Object.prototype.hasOwnProperty.call(body, prop)) {
            return false;
        }

        // Check the type of the property
        if ((prop === 'title' || prop === 'user_id') && typeof body[prop] !== 'string') {
            return false;
        }

        // Additional checks for the length of id and user_id
        if ((prop === 'user_id') && body[prop].length > 3) {
            return false;
        }
        
        // Check for the length of title
        if (prop === 'title' && body[prop].length > 20) {
            return false;
        }

        // Check for the budget to be integer
        if (prop === 'budget' && !Number.isInteger(body[prop])) {
            return false;
        }

        return true;
    });
};


module.exports = {isValidEnvelopeBody, isValidUpdateBody};