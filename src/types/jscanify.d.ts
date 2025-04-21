// workaround because jscanify does not ship with types out of the box
declare module 'jscanify' {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jscanify: any;
    export default jscanify;
}
