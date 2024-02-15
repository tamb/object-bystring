interface IMockObject {
    name: {
        first: string;
        last: string;
        nickNames: string[];
    };
    people?: string[];
    place: {
        address: {
            street: string;
            city: string;
            state: string;
            zip: string;
            county?: string;
            date?: Date;
        };
    };
    foo: string;
    buzz?: string;
}
declare const objectToMock: IMockObject;
export default objectToMock;
//# sourceMappingURL=mocks.d.ts.map