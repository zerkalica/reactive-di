/* @flow */

export default function createIdCreator(defaultSalt?: string): () => string {
    let lastId: number = 0;
    const salt: string = defaultSalt || Math.random().toString(36).substr(2, 6);

    return function createId(): string {
        return salt + '.' + (++lastId)
    }
}
