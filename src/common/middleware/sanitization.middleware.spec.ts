import { SanitizationMiddleware } from './sanitization.middleware';
import { Request, Response, NextFunction } from 'express';

describe('SanitizationMiddleware', () => {
  let middleware: SanitizationMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new SanitizationMiddleware();
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('XSS Prevention', () => {
    it('should remove script tags from body', () => {
      mockRequest.body = {
        name: '<script>alert("XSS")</script>John',
        email: 'test@example.com',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      // Script tags should be escaped/removed
      expect(mockRequest.body.name).not.toContain('<script>');
      expect(mockRequest.body.name).not.toContain('</script>');
      // The dangerous executable script should be neutralized
      expect(mockRequest.body.name).toContain('John');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should escape HTML entities', () => {
      mockRequest.body = {
        description: '<img src=x onerror=alert(1)>',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.description).not.toContain('<img');
      expect(mockRequest.body.description).not.toContain('onerror');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize nested objects', () => {
      mockRequest.body = {
        user: {
          name: '<script>alert("nested")</script>Jane',
          profile: {
            bio: '<b>Bold text</b>',
          },
        },
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.user.name).not.toContain('<script>');
      expect(mockRequest.body.user.profile.bio).not.toContain('<b>');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should sanitize arrays', () => {
      mockRequest.body = {
        tags: [
          '<script>alert(1)</script>',
          'normal-tag',
          '<img src=x onerror=alert(2)>',
        ],
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.tags[0]).not.toContain('<script>');
      expect(mockRequest.body.tags[1]).toBe('normal-tag');
      expect(mockRequest.body.tags[2]).not.toContain('<img');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize potential SQL injection attempts', () => {
      mockRequest.body = {
        email: "admin'--",
        password: "' OR '1'='1",
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      // The sanitizer should escape special characters
      expect(mockRequest.body.email).not.toBe("admin'--");
      expect(mockRequest.body.password).not.toBe("' OR '1'='1");
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should remove null bytes', () => {
      mockRequest.body = {
        name: 'John\x00Doe',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.name).not.toContain('\x00');
      expect(mockRequest.body.name).toBe('JohnDoe');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Query Parameters', () => {
    it('should sanitize query parameters', () => {
      mockRequest.query = {
        search: '<script>alert("query")</script>test',
        filter: 'normal',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.query.search).not.toContain('<script>');
      expect(mockRequest.query.filter).toBe('normal');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('URL Parameters', () => {
    it('should sanitize URL parameters', () => {
      mockRequest.params = {
        id: '<script>123</script>',
        name: 'test<img>',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.params.id).not.toContain('<script>');
      expect(mockRequest.params.name).not.toContain('<img>');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Data Type Preservation', () => {
    it('should preserve numbers', () => {
      mockRequest.body = {
        age: 25,
        price: 99.99,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.age).toBe(25);
      expect(mockRequest.body.price).toBe(99.99);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should preserve booleans', () => {
      mockRequest.body = {
        isActive: true,
        isDeleted: false,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.isActive).toBe(true);
      expect(mockRequest.body.isDeleted).toBe(false);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle null and undefined', () => {
      mockRequest.body = {
        nullValue: null,
        undefinedValue: undefined,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.nullValue).toBeNull();
      expect(mockRequest.body.undefinedValue).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Whitespace Handling', () => {
    it('should trim whitespace from strings', () => {
      mockRequest.body = {
        name: '  John Doe  ',
        email: '\t\ttest@example.com\n',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.name).toBe('John Doe');
      expect(mockRequest.body.email).toBe('test@example.com');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Control Characters', () => {
    it('should remove control characters', () => {
      mockRequest.body = {
        text: 'Hello\x01\x02\x03World',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.text).toBe('HelloWorld');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty body', () => {
      mockRequest.body = {};

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body).toEqual({});
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle missing body', () => {
      delete mockRequest.body;

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle empty strings', () => {
      mockRequest.body = {
        name: '',
        description: '',
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockRequest.body.name).toBe('');
      expect(mockRequest.body.description).toBe('');
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
