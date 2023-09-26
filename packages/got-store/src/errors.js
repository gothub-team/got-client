/* eslint-disable max-classes-per-file */
import * as R from 'ramda';
import * as RA from 'ramda-adjunct';
import { isEdgeTypesString } from '@gothub-team/got-core';

export const MISSING_PARAM_ERROR = 'MissingParamError';
export class MissingParamError extends Error {
    constructor(missing, example) {
        super(missing ? `Parameter '${missing}' is missing.${example ? `\nProvide parameter like:\n\n '${example}'.` : ''}` : '');
        this.name = MISSING_PARAM_ERROR;
        this.missing = missing;
    }
}
export const INVALID_PARAM_ERROR = 'InvalidParamError';
export class InvalidParamError extends Error {
    constructor(invalid, example) {
        super(invalid ? `Parameter '${invalid}' is invalid.${example ? `\nProvide parameter like:\n\n '${example}'.` : ''}` : '');
        this.name = INVALID_PARAM_ERROR;
        this.invalid = invalid;
    }
}
export const CONFIGURATION_ERROR = 'ConfigurationError';
export class ConfigurationError extends Error {
    constructor(missing, message) {
        super(message);
        this.name = CONFIGURATION_ERROR;
        this.missing = missing;
    }
}

const viewExample = JSON.stringify({
    'todo-list1': {
        include: {
            node: true,
            rights: true,
        },
        edges: {
            'todo-list/todo': {
                include: {
                    edges: true,
                    metadata: true,
                },
            },
        },
    },
}, null, 2);
const graphExample = JSON.stringify({
    nodes: {
        node1: {
            id: 'node1',
            someProp: 'someValue',
        },
    },
}, null, 2);
const nodeExample = JSON.stringify({
    id: 'todo123',
    text: 'buy groceries',
}, null, 2);
const rightsExample = JSON.stringify({
    read: true,
    write: true,
    admin: false,
}, null, 2);
const fileExample = 'new Blob([\'hello there\'], { type: \'text/plain\' })';

const validators = {
    api: (value, onError) => {
        if (!value || !value.pull || !value.push) {
            onError && onError(new ConfigurationError(
                'api',
                '"api" is missing in configuration. "push()" and "pull()" will fail.',
            ));
            return false;
        }
        return true;
    },
    dispatch: (value, onError) => {
        if (!value) {
            onError && onError(new ConfigurationError(
                'dispatch',
                '"dispatch" is missing in configuration. "push()", "pull()" and all mutators will fail.',
            ));
            return false;
        }
        return true;
    },
    select: (value, onError) => {
        if (!value) {
            onError && onError(new ConfigurationError(
                'select',
                '"select" is missing in configuration. "push()", "pull()" will fail.',
            ));
            return false;
        }
        return true;
    },
    graphName: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('graphName', 'todo-page'));
            return false;
        }
        return true;
    },
    view: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('view', viewExample));
            return false;
        }
        return true;
    },
    stack: (value, onError) => {
        if (!value || RA.lengthEq(0, value)) {
            onError && onError(new MissingParamError('stack', ['offline', 'todo-page', 'dialog']));
            return false;
        }
        return true;
    },
    fromGraph: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('fromGraph', graphExample));
            return false;
        }
        return true;
    },
    fromGraphName: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('fromGraphName', 'todo-page'));
            return false;
        }
        return true;
    },
    toGraphName: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('toGraphName', 'todo-page'));
            return false;
        }
        return true;
    },
    name: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('name', 'todoId'));
            return false;
        }
        return true;
    },
    value: () => true,
    node: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('node', nodeExample));
            return false;
        }
        if (!value.id) {
            onError && onError(new MissingParamError('node.id', nodeExample));
            return false;
        }
        return true;
    },
    edgeTypes: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('edgeTypes', 'todo-list/todo'));
            return false;
        }
        if (!isEdgeTypesString(value)) {
            onError && onError(new InvalidParamError('edgeTypes', 'todo-list/todo'));
            return false;
        }
        return true;
    },
    toNode: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('toNode', nodeExample));
            return false;
        }
        if (!value.id) {
            onError && onError(new MissingParamError('toNode.id', nodeExample));
            return false;
        }
        return true;
    },
    email: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('email', 'some.user@mail.me'));
            return false;
        }
        return true;
    },
    role: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('role', 'todo123'));
            return false;
        }
        return true;
    },
    rights: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('rights', rightsExample));
            return false;
        }
        return true;
    },
    nodeId: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('nodeId', 'todo123'));
            return false;
        }
        return true;
    },
    fromId: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('fromId', 'todo123'));
            return false;
        }
        return true;
    },
    toId: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('toId', 'todo123'));
            return false;
        }
        return true;
    },
    prop: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('prop', 'file1'));
            return false;
        }
        return true;
    },
    filename: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('filename', 'file1.txt'));
            return false;
        }
        return true;
    },
    file: (value, onError) => {
        if (!value) {
            onError && onError(new MissingParamError('file', fileExample));
            return false;
        }
        if (!value.type) {
            onError && onError(new MissingParamError('file.type', 'text/plain'));
            return false;
        }
        // TODO throw invalid input when file is not blob/buffer?
        if (!value.type || !value.size) {
            onError && onError(new InvalidParamError('file', fileExample));
            return false;
        }
        return true;
    },
};

export const validateInput = onError => input => R.compose(
    R.call,
    R.allPass,
    R.map(inputKey => () => validators[inputKey](input[inputKey], onError)),
    R.keys,
)(input);
