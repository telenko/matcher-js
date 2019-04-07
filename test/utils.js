export function delay() {
    return new Promise(r => setTimeout(r));
}