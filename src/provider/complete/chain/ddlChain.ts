import * as vscode from "vscode";
import { CompletionItem } from "vscode";
import { ComplectionContext } from "../complectionContext";
import { BaseChain } from "./baseChain";

export class DDLChain extends BaseChain {

    private keywordComplectionItems: vscode.CompletionItem[] = this.strToComplection(["Table", "Procedure", "View", "Function", "Trigger"])

    getComplection(complectionContext: ComplectionContext): CompletionItem[] | Promise<CompletionItem[]> {

        const firstToken = complectionContext.tokens[0]?.content?.toLowerCase()
        if (!firstToken) return []
        const secondToken = complectionContext.tokens[1]?.content?.toLowerCase()

        if (['create', 'alter', 'drop'].indexOf(firstToken) == -1) {
            return []
        }

        this.needStop = true;
        if (!secondToken) {
            return this.keywordComplectionItems;
        }

        if (firstToken == 'create') {
            switch (secondToken) {
                case 'table':
                    return this.strToComplection(["AUTO_INCREMENT", "NULL", "NOT", "PRIMARY", "CURRENT_TIME", "REFERENCES",
                        "DEFAULT", "COMMENT", "UNIQUE", "KEY", "FOREIGN", "CASCADE", "RESTRICT", "UNSIGNED", "CURRENT_TIMESTAMP"])
            }
        } else {
            switch (secondToken) {
                case 'table': break;
                case 'view': break;
                case 'procedure': break;
                case 'function': break;
                case 'trigger': break;
            }
        }


        return [];
    }

}