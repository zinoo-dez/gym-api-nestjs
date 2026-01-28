import { validate } from 'class-validator';
import { IsPhone, IsPastDate, IsFutureDate } from './index';

class TestPhoneDto {
  @IsPhone()
  phone!: string;
}

class TestPastDateDto {
  @IsPastDate()
  dateOfBirth!: string;
}

class TestFutureDateDto {
  @IsFutureDate()
  schedule!: string;
}

describe('Custom Validators', () => {
  describe('IsPhone', () => {
    it('should accept valid phone numbers', async () => {
      const validPhones = [
        '+1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '1234567890',
        '+44 20 7946 0958',
      ];

      for (const phone of validPhones) {
        const dto = new TestPhoneDto();
        dto.phone = phone;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid phone numbers', async () => {
      const invalidPhones = ['123', 'abc', '12345', '123456789012345678'];

      for (const phone of invalidPhones) {
        const dto = new TestPhoneDto();
        dto.phone = phone;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.isPhone).toBe(
          'phone must be a valid phone number',
        );
      }
    });
  });

  describe('IsPastDate', () => {
    it('should accept dates in the past', async () => {
      const dto = new TestPastDateDto();
      dto.dateOfBirth = '1990-01-01';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject dates in the future', async () => {
      const dto = new TestPastDateDto();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      dto.dateOfBirth = futureDate.toISOString();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isPastDate).toBe(
        'dateOfBirth must be a date in the past',
      );
    });

    it('should reject invalid dates', async () => {
      const dto = new TestPastDateDto();
      dto.dateOfBirth = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('IsFutureDate', () => {
    it('should accept dates in the future', async () => {
      const dto = new TestFutureDateDto();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      dto.schedule = futureDate.toISOString();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject dates in the past', async () => {
      const dto = new TestFutureDateDto();
      dto.schedule = '1990-01-01';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isFutureDate).toBe(
        'schedule must be a date in the future',
      );
    });

    it('should reject invalid dates', async () => {
      const dto = new TestFutureDateDto();
      dto.schedule = 'invalid-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
