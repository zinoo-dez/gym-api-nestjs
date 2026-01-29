import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator to ensure a date is in the past
 * Useful for date of birth validation
 */
export function IsPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isPastDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            return true; // Allow empty values (use @IsNotEmpty if required)
          }

          const date = new Date(value);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            return false;
          }

          // Check if date is in the past
          return date < new Date();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date in the past`;
        },
      },
    });
  };
}
