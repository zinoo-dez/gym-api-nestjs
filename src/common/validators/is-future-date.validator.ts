import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator to ensure a date is in the future
 * Useful for class schedules, membership end dates, etc.
 */
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
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

          // Check if date is in the future
          return date > new Date();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a date in the future`;
        },
      },
    });
  };
}
