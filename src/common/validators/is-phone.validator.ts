import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator for phone numbers
 * Validates international phone number formats
 * Accepts formats like: +1234567890, (123) 456-7890, 123-456-7890, 1234567890
 */
export function IsPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          // Remove all non-digit characters for validation
          const digitsOnly = value.replace(/\D/g, '');

          // Phone number should have 10-15 digits
          if (digitsOnly.length < 10 || digitsOnly.length > 15) {
            return false;
          }

          // Basic phone number pattern validation
          // Accepts: +1234567890, (123) 456-7890, 123-456-7890, 1234567890, +44 20 7946 0958
          const phonePattern =
            /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{0,9}$/;
          return phonePattern.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid phone number`;
        },
      },
    });
  };
}
