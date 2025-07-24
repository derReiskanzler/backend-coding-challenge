import { Hash, createHash, randomBytes } from 'crypto';

export class Encryptor {
    public static encrypt(raw: string) : { passwordHash: string, salt: string} {
        let hash: Hash = createHash('sha256');
        const salt: string = hash.update(randomBytes(16)).digest('hex');

        hash = createHash('sha256');

        return {
            passwordHash: hash.update(salt + raw).digest('hex'),
            salt: salt
        };
    }

    public static validate(hashPhrase: string, raw: string, salt: string): boolean {
        const hash: Hash = createHash('sha256');
        return hash.update(salt + raw).digest('hex') == hashPhrase;
    }
}