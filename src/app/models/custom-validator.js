"use strict";
exports.__esModule = true;
exports.CustomValidator = void 0;
var CustomValidator = /** @class */ (function () {
    function CustomValidator() {
    }
    CustomValidator.patternValidator = function (regex, error) {
        return function (control) {
            if (!(control === null || control === void 0 ? void 0 : control.value)) {
                return;
            }
            var valid = regex.test(control.value);
            return valid ? null : error;
        };
    };
    return CustomValidator;
}());
exports.CustomValidator = CustomValidator;
