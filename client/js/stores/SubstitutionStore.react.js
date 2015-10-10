var MellonDispatcher = require('../dispatcher/MellonDispatcher'),
    MellonConstants = require('../constants/MellonConstants'),
    EventEmitter = require('events').EventEmitter,
    assign = require('object-assign');

var substitutions = Mellon.substitutions,
    ActionTypes = MellonConstants.ActionTypes,
    CHANGE_EVENT = 'change',
    SubstituionStore = assign({}, EventEmitter.prototype, {
        emitChange: function() {
            this.emit(CHANGE_EVENT);
        },
        addChangeListener: function(callback) {
            this.on(CHANGE_EVENT, callback);
        },
        removeChangeListener: function(callback) {
            this.removeListener(CHANGE_EVENT, callback);
        },
        getAll: function() {
            return substitutions;
        }
    });

SubstituionStore.dispatchToken = MellonDispatcher.register(function(action) {
    switch(action.type) {
        case ActionTypes.UPDATE_SUBSTITUTIONS:
            substitutions = action.substitutions;
            SubstituionStore.emitChange();
            break;
        default:
            //noop
    }
});

module.exports = SubstituionStore;
