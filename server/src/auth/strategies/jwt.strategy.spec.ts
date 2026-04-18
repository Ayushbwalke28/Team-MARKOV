import { JwtStrategy } from './jwt.strategy';

// Passport calls validate() after verifying the JWT signature.
// We only need to test the validate() method's transformation logic here.

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should transform payload into { userId, email }', async () => {
      const payload = { sub: 'user-abc', email: 'alice@example.com', iat: 1000, exp: 9999 };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: 'user-abc', email: 'alice@example.com' });
    });

    it('should map payload.sub to userId', async () => {
      const payload = { sub: 'my-user-id', email: 'test@example.com' };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('my-user-id');
    });

    it('should map payload.email to email', async () => {
      const payload = { sub: 'uid-1', email: 'specific@example.com' };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('specific@example.com');
    });

    it('should not include extra payload fields in the result', async () => {
      const payload = { sub: 'uid-2', email: 'test@example.com', jti: 'some-jti', type: 'access' };

      const result = await strategy.validate(payload);

      expect(Object.keys(result)).toEqual(['userId', 'email']);
    });

    it('should return a defined, non-null object', async () => {
      const result = await strategy.validate({ sub: 'uid-3', email: 'x@x.com' });

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });
});
