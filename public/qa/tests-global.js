/**
 * Created by markustorok on 02/07/14.
 */
suite('Global Tests', function () {
    test('page has a valid title', function () {
        assert(document.title && document.title.match(/\S/) &&
            document.title.toUpperCase() !== 'TODO');
    });
});