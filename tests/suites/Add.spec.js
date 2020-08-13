import { Add } from '../../src/Add.js';

describe('Add', () => {
    it('Should return 5 for 3+2', () => {
        expect(Add(3, 2)).equals(5);
    });
});