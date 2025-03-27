import { BaseOutputParser } from "@langchain/core/output_parsers";

// Define an interface for the output parser
interface IOutputParser {
    parse(text: any): Promise<any>;
    getFormatInstructions(): any;
}

class LineList {
    lines: string[];

    constructor(lines: string[]) {
        this.lines = lines;
    }
}

// Implement the interface in LineListOutputParser
class LineListOutputParser extends BaseOutputParser<LineList> implements IOutputParser {
    async parse(text: string): Promise<LineList> {
        
        // Ensure text is a string
        if (typeof text !== 'string') {
            throw new TypeError("Expected text to be a string: " + typeof text);
        }

        const startKeyIndex = text.indexOf("<questions>");
        const endKeyIndex = text.indexOf("</questions>");
        const questionsStartIndex =
        startKeyIndex === -1 ? 0 : startKeyIndex + "<questions>".length;
        const questionsEndIndex = endKeyIndex === -1 ? text.length : endKeyIndex;
        const lines = text
        .slice(questionsStartIndex, questionsEndIndex)
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "");

        console.log(lines);

        return { lines };
    }

    getFormatInstructions(): string {
        return "Provide a list of non-empty lines.";
    }

    lc_namespace: string[] = ["LineListOutputParser"];
}

export { IOutputParser, LineListOutputParser };