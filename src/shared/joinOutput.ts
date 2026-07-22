import stripAnsi from "strip-ansi"

/*
 * helper function to produce a new array where every item is guaranteed to be a plain string
 * this is for step 4 of onTestEnd() method
*/
export function joinOutput(messageChunk: (string | Buffer)[], maxLength: number): string {
    return stripAnsi(messageChunk.map((item) => {
        if (typeof item === "string") {
            return item;
        } else {
            return item.toString();
        }
    }).join("")).slice(0, maxLength);
}