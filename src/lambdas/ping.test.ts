import { ping } from "./ping";

test('simple ping test', () => {
    expect(ping()).toBe('ping');
});