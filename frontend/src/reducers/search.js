const searchReducer = (state = false, action) => {
    switch(action.type) {
        case 'SEARCH':
            return true;
        case 'STOP_SEARCH':
            return false;
        default:
            return state;
    }
}

export default searchReducer