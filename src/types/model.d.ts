export interface IField {
    name: string;
    upper_left: [number, number];
    lower_right: [number, number];
    is_multiline: boolean;
}

export interface IForwarder {
    send: (json: object) => Promise<boolean>;
}
