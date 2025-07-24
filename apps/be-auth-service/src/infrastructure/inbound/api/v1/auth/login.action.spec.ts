import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginV1Action } from './login.action';
import { AuthenticatedUser } from '@backend-monorepo/boilerplate';

describe('LoginV1Action', () => {
    let action: LoginV1Action;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockJwtService: jest.Mocked<JwtService>;
    let mockResponse: jest.Mocked<Response>;

    beforeEach(async () => {
        const mockConfigServiceImpl = {
            get: jest.fn(),
        };

        const mockJwtServiceImpl = {
            sign: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [LoginV1Action],
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigServiceImpl,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtServiceImpl,
                },
            ],
        }).compile();

        action = module.get<LoginV1Action>(LoginV1Action);
        mockConfigService = module.get(ConfigService);
        mockJwtService = module.get(JwtService);

        mockResponse = {
            cookie: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        } as any;

        jest.clearAllMocks();
    });

    describe('index', () => {
        const mockUser: AuthenticatedUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'testuser',
        };

        const jwtExpiration = 3600; // 1 hour in seconds
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

        beforeEach(() => {
            mockConfigService.get.mockReturnValue(jwtExpiration);
            mockJwtService.sign.mockReturnValue(mockToken);
        });

        it('should login user successfully', async () => {
            await action.index(mockUser, mockResponse);

            expect(mockConfigService.get).toHaveBeenCalledWith('jwt.expiration');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                username: mockUser.username,
                sub: mockUser.id,
            });
            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'Authentication',
                mockToken,
                expect.objectContaining({
                    expires: expect.any(Date),
                    httpOnly: true,
                })
            );
            expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
        });

        it('should create JWT token with correct payload', async () => {
            await action.index(mockUser, mockResponse);

            expect(mockJwtService.sign).toHaveBeenCalledWith({
                username: 'testuser',
                sub: '123e4567-e89b-12d3-a456-426614174000',
            });
            expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
        });

        it('should set cookie with correct expiration time', async () => {
            await action.index(mockUser, mockResponse);

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                'Authentication',
                mockToken,
                expect.objectContaining({
                    expires: expect.any(Date),
                    httpOnly: true,
                })
            );
        });
    });

    describe('error handling', () => {
        const mockUser: AuthenticatedUser = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            username: 'testuser',
        };

        it('should propagate ConfigService errors', async () => {
            const errorMsg = 'Configuration not found';
            mockConfigService.get.mockImplementation(() => {
                throw new Error(errorMsg);
            });

            await expect(action.index(mockUser, mockResponse)).rejects.toThrow(
                errorMsg
            );

            expect(mockJwtService.sign).not.toHaveBeenCalled();
            expect(mockResponse.cookie).not.toHaveBeenCalled();
            expect(mockResponse.send).not.toHaveBeenCalled();
        });

        it('should propagate JwtService errors', async () => {
            mockConfigService.get.mockReturnValue(3600);
            const errorMsg = 'JWT signing failed';
            mockJwtService.sign.mockImplementation(() => {
                throw new Error(errorMsg);
            });

            await expect(action.index(mockUser, mockResponse)).rejects.toThrow(
                errorMsg
            );

            expect(mockResponse.cookie).not.toHaveBeenCalled();
            expect(mockResponse.send).not.toHaveBeenCalled();
        });

        it('should handle response cookie errors', async () => {
            mockConfigService.get.mockReturnValue(3600);
            mockJwtService.sign.mockReturnValue('valid-token');
            
            const errorMsg = 'Cookie setting failed';
            mockResponse.cookie.mockImplementation(() => {
                throw new Error(errorMsg);
            });

            await expect(action.index(mockUser, mockResponse)).rejects.toThrow(
                errorMsg
            );

            expect(mockResponse.send).not.toHaveBeenCalled();
        });

        it('should handle response send errors', async () => {
            mockConfigService.get.mockReturnValue(3600);
            mockJwtService.sign.mockReturnValue('valid-token');
            mockResponse.cookie.mockImplementation(() => mockResponse);
            
            const errorMsg = 'Response send failed';
            mockResponse.send.mockImplementation(() => {
                throw new Error(errorMsg);
            });

            await expect(action.index(mockUser, mockResponse)).rejects.toThrow(
                errorMsg
            );
        });
    });

    it('should handle multiple concurrent logins', async () => {
        const users: AuthenticatedUser[] = [
            { id: '123e4567-e89b-12d3-a456-426614174000', username: 'user1' },
            { id: '123e4567-e89b-12d3-a456-426614174001', username: 'user2' },
            { id: '123e4567-e89b-12d3-a456-426614174002', username: 'user3' },
        ];

        mockConfigService.get.mockReturnValue(3600);
        mockJwtService.sign.mockReturnValue('test-token');

        const promises = users.map(user => action.index(user, mockResponse));
        await Promise.all(promises);

        expect(mockConfigService.get).toHaveBeenCalledTimes(3);
        expect(mockJwtService.sign).toHaveBeenCalledTimes(3);
        expect(mockResponse.cookie).toHaveBeenCalledTimes(3);
        expect(mockResponse.send).toHaveBeenCalledTimes(3);
    });
});
